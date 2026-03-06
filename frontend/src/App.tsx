
import React from "react"
import UsersWidget from "./components/UsersWidget"
import ErrorBoundary from "./components/ErrorBoundary"

export default function App(){
  return (
    <ErrorBoundary>
      <UsersWidget/>
    </ErrorBoundary>
  )
}
