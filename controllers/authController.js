const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.register = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || password !== confirmpassword) {
    return res.status(422).json({ msg: 'Todos os campos são obrigatórios e as senhas devem coincidir.' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(422).json({ msg: 'Por favor, utilize outro e-mail!' });
  }

  try {
 
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

 
    const user = new User({ name, email, password: passwordHash });
    

    await user.save();
    res.status(201).json({ msg: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ msg: 'Erro no servidor, tente novamente.' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(422).json({ msg: 'Email e senha são obrigatórios!' });
  }

  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }

 
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(422).json({ msg: 'Senha inválida' });
    }

 
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });

    res.status(200).json({ msg: 'Autenticação realizada com sucesso!', token });
  } catch (error) {
    res.status(500).json({ msg: 'Erro no servidor, tente novamente.' });
  }
};


exports.getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: 'Erro no servidor, tente novamente.' });
  }
};
