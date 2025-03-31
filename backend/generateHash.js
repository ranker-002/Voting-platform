import bcrypt from 'bcryptjs';

const newPassword = 'adminpass'; // Remplace par le mot de passe souhaité

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;
  bcrypt.hash(newPassword, salt, (err, hash) => {
    if (err) throw err;
    console.log('Generated hash:', hash);
  });
});
