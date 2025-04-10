import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

function ErrorBoundary(props) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const unhandledError = window.onerror;

    window.onerror = function(message, source, line, column, error) {
      console.error(error);
      setHasError(true);
      // redirect the user to the error page
      window.location.href = '/signin';
    };

    return () => {
      // reset the error handler back to its original value
      window.onerror = unhandledError;
    };
  }, []);

  if (hasError) {
    return <Redirect to="/signin" />;
  }

  return props.children;
}

export default ErrorBoundary;
