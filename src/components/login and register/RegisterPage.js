import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onFormSubmit(e) {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCred);
    }
    catch(err) {
      console.log(err);
    }
  }
  return (
    <div className="m-5">
      <form onSubmit= {onFormSubmit}>
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
        <button>Create Account</button>
      </form>
      <div>
          <Link
            className="link"
            to="/"
          >Back to Login
          </Link>
        </div>
    </div>
  )
}