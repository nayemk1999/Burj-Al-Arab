import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import { firebaseConfig } from './firebase.config';
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router';
import { useForm } from "react-hook-form";

firebase.initializeApp(firebaseConfig);


const Login = () => {
    const [newUser, setNewUser] = useState(false)
    const [signUpUser, setSignUpUser] = useState({
        isSignedIn: false,
        name: '',
        email: '',
        success: false,
        password: '',
        error: ''
    });
    const [loggedInUser, setLoggedInUser] = useContext(UserContext);

    //redirect Route Login
    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };

    const googleSignIn = () => {
        const gProvider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
            .signInWithPopup(gProvider)
            .then((result) => {
                var credential = result.credential;
                var token = credential.accessToken;
                const { displayName, email } = result.user;
                const newSignInUser = { name: displayName, email: email }
                setSignUpUser(newSignInUser);
                setLoggedInUser(newSignInUser);
                history.replace(from);

            }).catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
                console.log(errorCode);
            });
    }
    const { register, handleSubmit, watch, errors } = useForm();

    const onSubmit = data => {
        // console.log(data);
        if (newUser && data.email && data.password) {
            firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
                .then(res => {
                    const { email } = res.user;
                    const newUserInfo = {
                        isSignedIn: false,
                        name: data.name,
                        email: email,
                        success: true,
                        password: data.password,
                        error: ''
                    }
                    setSignUpUser(newUserInfo);
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                });
        }
        if (!newUser && data.email && data.password)
            firebase.auth().signInWithEmailAndPassword(data.email, data.password)
                .then(res => {
                    const newUserInfo = res.user
                    setSignUpUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    history.replace(from);
                })
                .catch((error) => {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode, errorMessage);   
                });
    };

    return (
        <div>
            <button onClick={googleSignIn}>Login by Google</button>
            <input type="checkbox" name="newUser" onChange={() => setNewUser(!newUser)} id="" />
            <form onSubmit={handleSubmit(onSubmit)}>
                {newUser && <input name="name" ref={register({ required: true })} placeholder="Enter Your Name" />}
                {errors.name && <span>This field is required</span>}

                <input name="email" ref={register({ required: true })} placeholder="Enter Your Email" />
                {errors.email && <span>This field is required</span>}

                <input name="password" ref={register({ required: true })} placeholder="Enter Your Password" />
                {errors.password && <span>This field is required</span>}
                <input type="submit" />
            </form>
            {
                signUpUser.success && <p style={{ color: 'green' }}>User {newUser ? 'Create' : 'Logged In'} Successfully</p>
            }
        </div>
    );
}

export default Login;