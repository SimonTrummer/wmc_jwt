import './App.css';
import { useEffect, useState } from "react";

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Extract the token from the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token'); // Get JWT token from URL
        console.log(token);

        if (token) {
            fetch('http://localhost:4001/test/token', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.text())
                .then(data => setMessage(data || 'Success'))
                .catch(err => {
                    console.log(err);
                    setMessage('Error fetching data');
                });
        } else {
            setMessage('No token found in URL');
        }
    }, []);

    return (
        <div>
            {message}
        </div>
    );
}

export default App;
