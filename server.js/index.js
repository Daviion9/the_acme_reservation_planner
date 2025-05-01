const express = require('express');
const pg = require('pg');
const { Client } = pg;
const app = express();
const port = 3000;
const client = new Client({
    user: '',  
    password: '', 
    host: 'localhost',
    port: 5432,
    database: 'b34',
});


app.use(express.json());


app.get('/api/customers', async (req, res) => {
    try {
        const data = await client.query('SELECT * FROM customers');
        res.json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/api/restaurants', async (req, res) => {
    try {
        const data = await client.query('SELECT * FROM restaurant'); // corrected table name
        res.json(data.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/api/customers_restaurant', async (req, res) => {
    const { customers_id, restaurant_id, visit_date, party_count } = req.body;

    if (!customers_id || !restaurant_id || !visit_date || !party_count) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await client.query(
            'INSERT INTO customers_restaurant (customers_id, restaurant_id, visit_date, party_count) VALUES ($1, $2, $3, $4)',
            [customers_id, restaurant_id, visit_date, party_count]
        );

        res.status(201).json({ message: 'Reservation added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


    app.delete('/api/customers/:id/reservations', async (req, res) => {
        const { id } = req.params;
        const { restaurant_id, visit_date } = req.body;
    
        if (!restaurant_id || !visit_date) {
            return res.status(400).json({ error: 'restaurant_id and visit_date are required to delete a reservation' });
        }
    
        try {
            const result = await client.query(
                'DELETE FROM customers_restaurant WHERE customers_id = $1 AND restaurant_id = $2 AND visit_date = $3',
                [id, restaurant_id, visit_date]
            );
    
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Reservation not found' });
            }
    
            res.status(200).json({ message: 'Reservation deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    


app.listen(port, async () => {
    try {
        await client.connect();
        console.log(`Example app listening on port ${port}`);
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1);  
    }
});
