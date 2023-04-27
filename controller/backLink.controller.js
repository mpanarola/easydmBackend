const BackLinks = require('../model/BackLinks')
const Activity = require('../model/ActivityBackLinks')
const paginate = require('../helper/paginate')

exports.createBackLinks = async (req, res) => {
    try {
        const backLinkData = { ...req.body }
        const backLink = await BackLinks.create(backLinkData)
        if (!backLink) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create Back Link!!" })
        }
        const activityData = {
            backLinksId: backLink._id,
            addedBy: req.logInid,
            details: 'Back Link Created.',
            time: backLink.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [backLink], status: true, message: 'Back Link created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateBackLinks = async (req, res) => {
    try {
        

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteBackLinks = async (req, res) => {
    try {

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getBackLinks = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false
        const baclLinks = await paginate(option, BackLinks);
        return res.json({ data: [baclLinks], status: false, message: "" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getBackLinksById = async (req, res) => {
    try {

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}