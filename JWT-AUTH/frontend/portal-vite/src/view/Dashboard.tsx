import React, {useState, useEffect} from 'react';
import {Container, Typography, Button, Box, List, ListItem, ListItemText} from '@mui/material';
import {useAuth} from '../AuthContext';

type MicroServiceProps = {
    name: string;
    path: string;
}

const Dashboard: React.FC = () => {
    const {logout, accessToken} = useAuth();
    const [microServices, setMicroServices] = useState<MicroServiceProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:4000/portal', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setMicroServices(data.services);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching services:', error);
                setLoading(false);
            }
        };

        fetchServices();
    }, [accessToken]);

    const handleLogout = () => {
        logout();
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '100px',
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Following Microservices are available:
                </Typography>
                {loading ? (
                    <Typography>Loading services...</Typography>
                ) : (
                    <List>
                        {microServices.map((microService) => (
                            <ListItem key={microService.name}>
                                <a target={'_blank'} href={`${microService.path}?token=${accessToken}`} >
                                    <ListItemText
                                        primary={microService.name}
                                    />
                                </a>
                            </ListItem>
                        ))}
                    </List>
                )}

                <Box mt={4}>
                    <Button variant="contained" color="primary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;
