# React security patterns

This project focuses on implementing secure and efficient authentication strategies for web applications using React for the frontend and Node.js for the backend.

## Implementations

### Refreshing jwt token

JSON Web Tokens (JWT) provide a stateless and secure way to manage user authentication. The project implements a token-based authentication system with a focus on token refreshing.

Key Features

- Token Generation: Upon successful login, a JWT is generated and sent to the client.
- Token Storage: The JWT is securely stored on the client side (e.g., in local storage).
- Token Expiry: Tokens have a defined expiration time.
- Token Refresh: A refresh token is used to obtain a new JWT without requiring the user to log in again.

Implementation Highlights

- Token Expiration Handling: The frontend checks the token expiration and initiates a token refresh when needed.
- Secure Storage: JWTs are stored on the client side(localStorage) to prevent unauthorized access.

### Cookies and sessions

This method relies on Express.js middleware to manage user authentication using cookies and sessions. The following libraries are utilized:

- express-session: Express.js middleware for managing sessions.
- cookie-parser: Middleware to parse cookies attached to the client's request.
- csurf: Library for handling Cross-Site Request Forgery (CSRF) protection.
- session-file-store: A session store implementation for storing session data in files.

Libraries and How They Work Together

- express-session: Manages user sessions by creating a unique session identifier stored as a cookie on the client side. Session data is stored server-side, allowing for secure session management.

- cookie-parser: Parses cookies attached to the client's request, making cookie data accessible in the backend for authentication and session handling.

- csurf: Provides CSRF protection by generating and verifying unique tokens for each client request. This prevents unauthorized actions by ensuring that requests originate from the same application.

- session-file-store: A session store implementation that stores session data in files on the server. This ensures persistent session data even if the server restarts.

Implementation Highlights

- Middleware Integration: The project integrates these libraries seamlessly into the Express.js middleware stack to handle authentication and session management.
- CSRF Protection: Requests are validated for CSRF protection using tokens generated and verified by csurf.
- Secure Session Storage: Session data is securely stored using session-file-store, providing durability and reliability.

### Third party - Auth0

This application implements authentication using Auth0, a third-party authentication and authorization platform. The authentication flow involves redirecting the user to the Auth0 portal for sign-in or sign-up, and upon successful authentication, redirecting the user back to the app with an access token. The backend validates this token using Auth0's JSON Web Key Set (JWKS) keys.

Authentication Flow

1. The React app redirects the user to the Auth0 portal for authentication.
2. The user signs in or signs up on the Auth0 portal.
3. Auth0 redirects the user back to the React app with an access token.
4. When the React app interacts with the backend, it sends the access token.
5. The backend uses the express-jwt, express-jwt-authz, jwks-rsa, and jwtDecode libraries to validate the token using Auth0's JWKS keys.

Backend Libraries

- express-jwt: Middleware for Express.js that validates JWTs and sets req.user with the decoded token data.
- express-jwt-authz: Middleware for Express.js that validates user permissions from the token's scope.
- jwks-rsa: Library to retrieve RSA signing keys from a JWKS endpoint, which is provided by Auth0.
- jwtDecode: Utility library to decode JWTs on the server-side.

Frontend Library

- @auth0/auth0-react: Auth0's official React SDK for handling authentication and authorization. It simplifies the integration of Auth0 into React applications.

### Graphql auth

This application demonstrates a comprehensive implementation of authentication and authorization for a GraphQL API. The project covers various steps, including running the app and API, exploring the GraphQL implementation, including JWT in a GraphQL request, and enforcing authorization rules.

Technologies Used

- GraphQL: Apollo Server/Client
- Authentication: JSON Web Tokens (JWT)
- Authorization: Role-based
