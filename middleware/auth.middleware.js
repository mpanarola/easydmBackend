const jwt = require('jsonwebtoken');
const User = require('../model/User')

var checkUser = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization && !authorization.startsWith('Bearer')) {
            return res.json({ data: [], status: false, message: 'Token expired!!' })
        } else {
            let token = authorization.split(' ')[1]
            const _id = jwt.verify(token, process.env.SECRET_KEY)
            const user = await User.findById(_id)
            req.logInid = _id;
            req.type = user.userRole
            next();
        }
    } catch (error) {
        return res.json({ data: [], status: false, message: 'Unauthorized User!!' })
    }
}

module.exports = checkUser