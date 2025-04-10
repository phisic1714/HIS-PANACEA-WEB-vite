import React, { Suspense, lazy } from "react";
import Nprogress from "nprogress";
import "nprogress/nprogress.css";
import CircularProgress from "../components/CircularProgress";

// Function to wrap the lazy loading with Nprogress
export default function asyncComponent(importComponent) {
  const LazyComponent = lazy(() => {
    Nprogress.start();
    return importComponent().then(module => {
      Nprogress.done();
      return module;
    });
  });

  return function (props) {
    return (
      <Suspense fallback={<CircularProgress />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
