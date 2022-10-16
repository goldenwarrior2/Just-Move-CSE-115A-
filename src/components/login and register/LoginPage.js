import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function onFormSubmit (e) {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCred);
      navigate('/userhome');
    }
    catch(err) {
      console.log(err);
    }
  }
  return (
    <div className="m-5">
      <form onSubmit={onFormSubmit}>
        <div>
          <input
            value= {email}
            onChange= {(e) => setEmail(e.target.value)}
            placeholder="Email Address"
          />
        </div>
        <div>
          <input
            value= {password}
            onChange= {(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <button>Login</button>
        <div>
          <Link
            className="link"
            to="/register"
          >Create a new account
          </Link>
        </div>
      </form>
    </div>
  )
}