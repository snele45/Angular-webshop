const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const dataDir = path.join(__dirname, 'data');

app.get('/products', (req, res) => {
    const productsPath = path.join(dataDir, 'products.json');
    fs.readFile(productsPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading products file' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/register', (req, res) => {
    const newUser = req.body; // Podaci iz requesta
    const usersPath = path.join(__dirname, 'data', 'users.json');
    
    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') {
            // Ako fajl ne postoji, kreiraj ga sa praznim nizom
            fs.writeFileSync(usersPath, JSON.stringify([]));
            data = '[]'; // Inicijalno postavi kao prazan niz
        } else if (err) {
            return res.status(500).json({ message: 'Error reading users file' });
        }
        
        let users = JSON.parse(data);
        
        // Proveri da li email već postoji
        const userExists = users.some(user => user.email === newUser.email);
        
        if (userExists) {
            return res.status(400).send('Email već postoji');
        }
        
        // Dodaj novog korisnika
        newUser.id = users.length + 1;
        users.push(newUser);
        
        fs.writeFile(usersPath, JSON.stringify(users), (err) => {
            if (err) throw err;
            res.status(201).json({ message: 'Korisnik uspešno registrovan' });
        });
    });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;  // Podaci iz requesta
    const usersPath = path.join(__dirname, 'data', 'users.json');

    fs.readFile(usersPath, 'utf8', (err, data) => {
        if (err) throw err;

        const users = JSON.parse(data);

        // Provera postojanja korisnika sa unetim emailom i lozinkom
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            return res.status(200).json({ message: 'Uspešno ste prijavljeni', user });
        } else {
            return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
        }
    });
});
 

app.post('/updateProfile', (req, res) => {
    const updatedUser = req.body;  // Podaci koji dolaze sa frontenda
    const usersPath = path.join(dataDir, 'users.json');
  
    fs.readFile(usersPath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Greška pri čitanju datoteke' });
      }
      
      let users = JSON.parse(data);
  
      // Pronađi korisnika po ID-ju
      const userIndex = users.findIndex(user => user.id === updatedUser.id);
      
      if (userIndex !== -1) {
        // Ažuriraj podatke korisnika
        users[userIndex] = { ...users[userIndex], ...updatedUser };
  
        // Sačuvaj ažurirane podatke nazad u fajl
        fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ message: 'Greška pri pisanju u datoteku' });
          }
          res.json({ message: 'Podaci uspešno ažurirani' });
        });
      } else {
        // Ako korisnik nije pronađen
        res.status(404).json({ message: 'Korisnik nije pronađen' });
      }
    });
  });


// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
