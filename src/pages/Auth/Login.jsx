import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginBeajEmployee } from "../../helper";
import beaj_logo from "../../assets/images/beaj_logo.png";
import styles from "./Login.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { secureStorage } from "../../utils/xssProtection";
import { getRoleFromToken, getEmailFromToken } from "../../utils/jwtUtils";
import { handleError } from "../../utils/errorHandler";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const { email, password } = formData;
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await loginBeajEmployee({ email, password });
            if (response.status === 200) {
                const token = response.data.token;
                
                // Store token securely
                secureStorage.setItem('token', token);
                
                // Extract role and email from JWT token
                const role = getRoleFromToken(token);
                const tokenEmail = getEmailFromToken(token);
                
                if (role && tokenEmail) {
                    secureStorage.setItem('email', tokenEmail);
                    secureStorage.setItem('role', role);
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                    navigate("/dashboard");
                } else {
                    toast.error("Invalid token received. Please contact administrator.");
                    secureStorage.clear();
                }
            } else {
                toast.error(response.data.message || "Invalid Credentials");
            }
        } catch (error) {
            handleError(error, 'Login');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.login_page}>
            <ToastContainer />
            <div className={styles.login_container}>
                <img className={styles.beaj_logo} src={beaj_logo} alt="Beaj Logo" />
                <h1 className={styles.login_heading}>
                    Login to Beaj's Admin Panel
                </h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.input_container}>
                        <label className={styles.email_label}
                            htmlFor="email">
                            Enter your Beaj official email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className={styles.email_input}
                            required
                        />
                    </div>
                    <div className={styles.input_container}>
                        <label className={styles.password_label}
                            htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className={styles.password_input}
                            required
                        />
                    </div>
                    <button className={styles.login_button} type="submit"> {isLoading ? <div className="loader"></div> : "Let's Go!"}</button>
                </form>
            </div>
        </div >
    );
};

export default Login;
