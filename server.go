package main

import (
	"compress/flate"
	"context"
	"errors"
	"flag"
	"io"
	"log"
	"math/rand"
	"mime"
	"net/http"
	"os"
	"os/signal"
	"path"
	"strconv"
	"strings"
	"time"
)

const defaultRootDir = "."
const ENABLE_CACHE = false
const RESTRICT_EXTS = false
const DEFLATE_MIN = 1024
const DEFLATE_USE = false

var shouldCompress map[string]bool

func main() {
	rand.Seed(time.Now().Unix())
	flateTypes := flag.String("flate", "flate.types", "file containing list of types to deflate")
	www := flag.String("w", defaultRootDir, "directory to serve html from")
	flag.Parse()
	f, err := os.ReadFile(*flateTypes)
	if err != nil {
		shouldCompress = make(map[string]bool, 0)
	} else {
		data := strings.Split(string(f), "\n")
		shouldCompress = make(map[string]bool, len(data))
		for _, x := range data {
			if len(x) == 0 {
				continue
			}
			if x[len(x)-1] == '\r' {
				x = x[:len(x)-1]
			}
			shouldCompress[x] = true
		}
	}
	hndlr := http.NewServeMux()
	// hndlr.HandleFunc("/api/1/", apiHandler)
	hndlr.Handle("/api/", http.NotFoundHandler())
	hndlr.Handle("/", NewRootMount(*www, 0))
	srv := &http.Server{ReadHeaderTimeout: time.Second * 5, Handler: hndlr}
	go srv.ListenAndServe()
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	<-ch
	srv.Shutdown(context.Background())
}

func writeAll(w io.Writer, b []byte) error {
	for len(b) > 0 {
		c, err := w.Write(b)
		if err != nil {
			return err
		}
		b = b[c:]
	}
	return nil
}

type OperationTypes int

const (
	OP_CREATE OperationTypes = iota
	OP_REMOVE
	OP_RECURSIVEREMOVE
	OP_OPEN
	OP_CLOSE
	OP_STAT
	OP_READ
	OP_WRITE
	OP_MARSHALL
	OP_MOVE
	OP_COPY
)

var operStrings []string = []string{"create", "remove", "recursive remove", "open", "close", "stat", "read", "write", "marshall", "move", "copy"}

func logError(err error, op OperationTypes, path string) {
	log.Printf("[ERROR] error %s %s: %s\n", operStrings[op], path, err.Error())
}

type RootMountHandler struct {
	rootDir string
	strip   int
}

func NewRootMount(rootDir string, strip int) http.Handler {
	return RootMountHandler{rootDir, strip}
}

func (h RootMountHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	p := r.URL.Path
	if p[0] == '/' {
		p = p[1:]
	}
	if h.strip != 0 {
		tmp := strings.SplitAfterN(p, "/", h.strip+1)
		p = tmp[len(tmp)-1]
	}
	if p == "" {
		http.RedirectHandler("login.html", http.StatusMovedPermanently).ServeHTTP(w, r)
		return
	}
	if RESTRICT_EXTS {
		ind := strings.LastIndexByte(p, '.')
		ext := p[ind+1:]
		switch ext {
		case "html":
		case "htm":
		case "js":
		case "css":
		case "ico":
		case "png":
		case "svg":
		case "jpg":
		case "jpeg":
			break
		default:
			http.NotFound(w, r)
			return
		}
	}
	loc := path.Join(h.rootDir, p)
	SpecificFileHandler(loc).ServeHTTP(w, r)
}

type SpecificFileHandler string

func NewSpecificFileHandler(path string) http.Handler {
	return SpecificFileHandler(path)
}

func (h SpecificFileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Add("Allow", "GET, HEAD")
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	f, err := os.Open(string(h))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
			writeAll(w, []byte(err.Error()))
		}
		return
	}
	defer f.Close()
	stat, err := f.Stat()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		writeAll(w, []byte(err.Error()))
		return
	}
	if stat.IsDir() || !stat.Mode().IsRegular() {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	compress := false
	ind := strings.LastIndexByte(string(h), '.')
	if ind != -1 {
		mtype := mime.TypeByExtension(string(h)[ind:])
		if mtype != "" {
			w.Header().Add("Content-Type", mtype)
			if DEFLATE_USE {
				ind = strings.LastIndexByte(mtype, ';')
				if ind != -1 {
					mtype = mtype[:ind]
				}
				if stat.Size() > DEFLATE_MIN && shouldCompress[mtype] && strings.Contains(r.Header.Get("Accept-Encoding"), "deflate") {
					compress = true
					w.Header().Add("Content-Encoding", "deflate")
				}
			}
		}
	}
	// TODO: Maybe don't cache login pages
	if ENABLE_CACHE {
		w.Header().Add("Cache-Control", "public, max-age=604800")
	} else {
		w.Header().Add("Cache-Control", "no-cache")
	}
	w.Header().Add("Last-Modified", stat.ModTime().UTC().Format(time.RFC1123))
	modSince := r.Header.Get("If-Modified-Since")
	if modSince != "" {
		ts, err := time.Parse(time.RFC1123, modSince)
		if err != nil {
			w.Header().Del("Content-Encoding")
			w.Header().Del("Cache-Control")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		if ts.Equal(stat.ModTime().UTC()) {
			w.Header().Del("Content-Encoding")
			w.WriteHeader(http.StatusNotModified)
			return
		}
	}
	if r.Method == http.MethodGet {
		if DEFLATE_USE && compress {
			w2, _ := flate.NewWriter(w, flate.DefaultCompression)
			_, err = io.Copy(w2, f)
			if err == nil {
				err = w2.Flush()
			}
		} else {
			w.Header().Add("Content-Length", strconv.FormatInt(stat.Size(), 10))
			_, err = io.Copy(w, f)
		}
		if err != nil {
			logError(err, OP_COPY, string(h)+"-http")
		}
	} else {
		if !DEFLATE_USE || !compress {
			w.Header().Add("Content-Length", strconv.FormatInt(stat.Size(), 10))
		}
		w.WriteHeader(http.StatusOK)
	}
}
