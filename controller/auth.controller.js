const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User')
const transport = require('../util/sendmail')

exports.registration = async (req, res) => {
    try {
        const data = { ...req.body };
        let avatar = 'def.png';
        if (req.file !== undefined) {
            avatar = req.file.filename;
        }
        data.avatar = avatar
        const userCheck = await User.findOne({ $and: [{ email: data.email }, { username: data.username }] })
        if (userCheck) {
            return res.status(409).json({ message: 'User already exits!!' });
        }
        data.userRole = 2
        // const password = Math.random().toString(36).slice(-8);
        // data.password = password
        const userData = new User(data)
        const user1 = await userData.save()
        if (!user1) {
            return res.status(400).json({ message: `User not Registered!!` })
        }
        // transport.sendMail({
        //     to: data.email,
        //     from: 'fparmar986@gmail.com',
        //     subject: 'Registered Successfully!!',
        //     html: `<h1>Get your password!!</h1><br />
        //                     <p>Hello ${data.name}!!</p><br />
        //                     <p>Your password is : ${password}</p>`
        // })
        // if (!transport) {
        //     return res.status(404).json({ message: 'Somthing went wrong!!Can not sent mail to your emailid!!' })
        // }
        // return res.status(200).json({ message: `User's registered successfully!! Mail sent to your emailid!!!` })
        return res.status(200).json({ message: `User's registered successfully!!` })

    }
    catch (error) {
        return res.status(400).json({ message: error.message })
    }

}

// exports.refreshToken = async (req, res) => {
//     try {
//         const { refreshToken, username, _id } = req.body
//         if (refreshToken) {
//             const token = jwt.sign({
//                 username: username,
//                 _id: _id.toString()
//             }, process.env.SECRET_KEY, { expiresIn: '4h' })
//             return res.status(200).json({ message: 'Login successfully!!', token: token })
//         }
//     } catch (error) {
//         return res.status(400).json({ message: error.message })
//     }
// }

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (username === "") {
            return res.status(409).json({ message: "Please enter username or emailID or mobileNo. to login!!!" })
        }
        let filter = {
            $or: [
                { username: username },
                { email: username },
                { mobileNo: username }
            ]
        }

        let user = await User.findOne(filter)
        if (!user) {
            return res.status(409).json({ message: 'User does not exist!!' });
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password!!' });
        }
        const token = jwt.sign({
            username: user.username,
            _id: user._id.toString(),
        }, process.env.SECRET_KEY, { expiresIn: '5h' });
        return res.status(200).json({ message: 'Login successfully!!', token: token })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

exports.me = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.logInid })
            .select('-password -__v -createdAt -updatedAt -wrongAttempt')

        if (!user) {
            return res.status(409).json({ message: 'User does not exits!!' });
        }
        return res.status(200).json({ data: user });
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

exports.listOfUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -__v -createdAt -updatedAt -wrongAttempt')
        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

exports.forgotPassLink = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ message: 'Email does no exist!!' })
        }
        else {
            const cnt = user.wrongAttempt;
            if (cnt > 10) {
                return res.status(404).json({ message: 'Max attempt for resending mail is over!!' })
            }
            const token = jwt.sign({
                username: user.username,
                _id: user._id.toString()
            }, process.env.SECRET_KEY, { expiresIn: '1m' });
            await User.findOneAndUpdate({ email: email },
                {
                    $set:
                    {
                        wrongAttempt: parseInt(user.wrongAttempt) + 1,
                        resetPasswordToken: token,
                        expireToken: new Date().getTime() + 300 * 1000
                    }
                })
            transport.sendMail({
                to: email,
                from: 'fparmar986@gmail.com',
                subject: 'Reset Password!!',
                html: `<h1>Reset your password!!</h1><br />
                        <p>Please click on this link to reset your password.<br /><a href="${process.env.EMAIL}/${token}">Reset Password</a></p><br />
                        <p>This link will expire in 5 minutes...</p><br />
                        <p>Max Attempt for resend otp is 3!! This your ${cnt + 1} attempt.</p>`
            })
            if (!transport) {
                return res.status(404).json({ message: 'Somthing went wrong!!Can not sent mail to your emailid!!' })
            }
            return res.status(200).json({ message: 'Mail sent to your emailid!!!' })
        }
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { password, resetPasswordToken } = req.body
        const user = await User.findOne({ resetPasswordToken })
        let curTime = new Date().getTime();
        let extime = (user.expireToken).getTime();
        let diff = extime - curTime;
        if (diff < 0) {
            return res.status(400).json({ message: 'Link exprired!!, Please send again!!' })
        }
        user.password = password;
        const updatePassword = await user.save()
        if (!updatePassword) {
            return res.status(400).json({ message: 'Password is not updated!!' })
        }
        await User.findOneAndUpdate({ email: user.email },
            {
                wrongAttempt: 0,
                resetPasswordToken: "",
                expireToken: ""
            })
        return res.status(200).json({ message: 'Password Updated!!' })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { currpassword, password } = req.body
        const check = await User.findOne({ _id: req.logInid }).populate('password')
        const isMatch = await bcrypt.compare(currpassword, check.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is invalid!!' });
        }
        const hashPass = await bcrypt.hash(password, 10)
        const passswordStatus = await User.findByIdAndUpdate(req.logInid, {
            $set: { password: hashPass }
        })
        if (!passswordStatus) {
            return res.status(400).json({ message: 'Somthing went wrong!!' })
        }
        return res.status(200).json({ message: 'Password changed!!' })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}