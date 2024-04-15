import Admin from '../models/Admin.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const adminLogin = async (req, res, next) => {
  const username = req.body.username
  const password = req.body.password

  try {
    const admin = await Admin.findOne({ username })
    if (admin) {
      bcrypt.compare(password, admin.password, function (err, result) {
        if (result) {
          const token = jwt.sign({ username, role: 'admin' }, process.env.JWT)
          res.status(200).json({
            message: 'Login successfully',
            data: {
              token,
            },
          })
        } else {
          res.status(401).json({ message: 'Wrong username or password!' })
        }
      })
    } else {
      res.status(401).json({ message: 'Wrong username or password!' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
