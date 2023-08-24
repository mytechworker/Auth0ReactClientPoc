import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Auth0Provider } from '@auth0/auth0-react';
import config from './auth-config.json';
import { useAuth0 } from '@auth0/auth0-react';

console.log(config);

const App = () => {
    const [messageOne, setMessageOne] = useState();
    const [messageTwo, setMessageTwo] = useState();
    const {
        isLoading,
        isAuthenticated,
        error,
        user,
        loginWithRedirect,
        getAccessTokenSilently,
        logout,
    } = useAuth0();
    console.log(isLoading);
    console.log(isAuthenticated);
    console.log(error);
    console.log(user);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Oops... {error.message}</div>;
    }

    const fetchPublicAPI = async () => {
        try {
            const response = await axios.get('http://localhost:3010/api/public');
            setMessageOne(response.data.message)
            console.log(response);
        } catch (e) {
            setMessageOne(error.response.data.message)
            console.log(e);
        }

    };

    const fetchPrivateAPI = async (event) => {
        event.preventDefault();
        let response;
        try {
            if (isAuthenticated) {
                let token = await getAccessTokenSilently();
                response = await axios.get('http://localhost:3010/api/private', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

            } else {
                response = await axios.get('http://localhost:3010/api/private')
            }
            setMessageTwo(response.data.message);
            console.log(response);
        } catch (e) {
            console.log(e.response);
            setMessageTwo(e?.response.data.message);
            console.log(e)
        }
        console.log(user);
    };
    return (
        <div>
            <h1>Hello from Client</h1>
            { !isAuthenticated && <button onClick={loginWithRedirect}>Login</button>}
            { isAuthenticated && <button onClick={logout}>Logout</button>}
            <br />
            <hr />
            <hr />
            <br />
            <button onClick={fetchPublicAPI}>Call Public API</button>
            Message From Public API: {messageOne}
            <br />
            <br />
            <button onClick={fetchPrivateAPI}>Call Private API</button>
            Message from Private API: {messageTwo}
        </div>

    )
}

ReactDOM.render(<div className="app">
    <Auth0Provider
        domain={config.domain}
        clientId={config.clientId}
        redirectUri={window.location.origin}
        audience={config.audience}
        useRefreshTokens={true}
        cacheLocation="localstorage"
    >
        <App />
    </Auth0Provider>
</div>, document.querySelector('#root') );
