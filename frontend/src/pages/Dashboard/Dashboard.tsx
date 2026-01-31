import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch summary:', error);
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = [
    { title: 'Total Users', value: summary.totalUsers, color: '#1976d2' },
    { title: 'Active Users', value: summary.activeUsers, color: '#2e7d32' },
    { title: 'Inactive Users', value: summary.inactiveUsers, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 4 }} key={card.title}>
              <Card 
                sx={{ 
                  bgcolor: card.color, 
                  color: 'white',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h2" fontWeight="bold">
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;