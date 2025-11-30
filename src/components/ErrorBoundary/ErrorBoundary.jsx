import React from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'DEV';
        
        if (isDevelopment) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        
        // You can also log the error to an error reporting service here
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'DEV';

            return (
                <div className={styles.errorBoundary}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIcon}>⚠️</div>
                        <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
                        <p className={styles.errorMessage}>
                            We're sorry, but something unexpected happened. 
                            Please try refreshing the page or go back to the home page.
                        </p>
                        
                        {isDevelopment && this.state.error && (
                            <details className={styles.errorDetails}>
                                <summary>Error Details (Development Only)</summary>
                                <pre className={styles.errorStack}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        
                        <div className={styles.errorActions}>
                            <button 
                                onClick={this.handleReload} 
                                className={styles.primaryButton}
                            >
                                Reload Page
                            </button>
                            <button 
                                onClick={this.handleGoHome} 
                                className={styles.secondaryButton}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

