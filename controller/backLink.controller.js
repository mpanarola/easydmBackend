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
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        const linkData = { ...req.body }
        const updateLink = await BackLinks.findByIdAndUpdate(req.params.id, linkData)
        if (!updateLink) {
            return res.json({ data: [], status: false, message: 'Not able to update Content Scheduler!!' })
        }
        const updatedFields = []
        Object.keys(req.body).forEach(function (fields) {
            updatedFields.push(fields)
        });
        const activityData = {
            backLinksId: checkLink._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            fields: updatedFields,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkLink.updatedAt
        }
        await Activity.create(activityData)
        return res.json({ data: [], status: true, message: 'Back Link updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteBackLinks = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the back link!!' })
        }
        const deleteLink = await BackLinks.findByIdAndRemove(req.params.id)
        if (!deleteLink) {
            return res.json({ data: [], status: false, message: 'Not able to update back link!!' })
        }
        return res.json({ data: [], status: true, message: 'Back link deleted!!' })
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
        const backLinks = await paginate(option, BackLinks);
        return res.json({ data: [backLinks], status: false, message: "" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getBackLinksById = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
            .populate('webpage', 'webpage category')
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        return res.json({ data: [checkLink], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        const activityData = await Activity.find({ backLinksId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this back link!!' })
        }
        return res.json({ data: [activityData], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.history = async (req, res) => {
    try {
        // const currentMonth = new Date().toLocaleString('default', { month: 'short' })
        // const lastYearMonth = Date.now() + -365 * 24 * 3600000
        // const d = new Date(lastYearMonth).toLocaleString('default', { month: 'short' })
        let monthYear = [], data = []
        for (let i = 24; i >= 2; i--) {
            const date = Date.now() + -365 * i * 3600000
            const nextMonth = Date.now() + -365 * (i - 2) * 3600000
            const dateFormat = new Date(date).toISOString()
            const nextDateFormat = new Date(nextMonth).toISOString()
            const month = new Date(date).toLocaleString('default', { month: 'short' })
            const year = new Date(date).getFullYear();
            const betweenDate = { $lte: nextDateFormat, $gte: dateFormat }
            console.log('Dates ==>', betweenDate)
            const monthWise = await BackLinks.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }] })
            console.log('Data ==>', monthWise)
            let count = 0
            monthWise.forEach(element => {
                count = count + element.numberOfBacklinks
            });
            monthYear.push(`${month} - ${year}`)
            data.push(count)
            i--
        }
        return res.json({ data: { data: data, months: monthYear }, status: true, message: "Last 1 Year's Data." })

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}