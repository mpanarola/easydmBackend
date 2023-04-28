const DayBook = require('../model/DayBook')
const Activity = require('../model/ActivityDayBook')
const paginate = require('../helper/paginate')

exports.createDayBook = async (req, res) => {
    try {
        const dayBookData = { ...req.body }
        dayBookData.addedBy = req.logInid
        const dayBook = await DayBook.create(dayBookData)
        if (!dayBook) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create day book!!" })
        }
        const activityData = {
            dayBookId: dayBook._id,
            addedBy: req.logInid,
            details: 'Day Book Created.',
            time: dayBook.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [dayBook], status: true, message: 'Day book created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const dayBookData = { ...req.body }
        const updateBook = await DayBook.findByIdAndUpdate(req.params.id, dayBookData)
        if (!updateBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        const updatedFields = []
        Object.keys(req.body).forEach(function (fields) {
            updatedFields.push(fields)
        });
        const activityData = {
            dayBookId: checkBook._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            fields: updatedFields,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkBook.updatedAt
        }
        await Activity.create(activityData)
        return res.json({ data: [updateBook], status: true, message: 'Day Book updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the Day Book!!' })
        }
        const deleteDayBook = await DayBook.findByIdAndRemove(req.params.id)
        if (!deleteDayBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        return res.json({ data: [], status: true, message: 'Day Book deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBook = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false
        const dayBook = await paginate(option, DayBook);
        return res.json({ data: [dayBook], status: false, message: "All the Day Book" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookById = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
            .populate('webpage', 'webpage category')
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        return res.json({ data: [checkBook], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const activityData = await Activity.find({ dayBookId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this Day Book!!' })
        }
        return res.json({ data: [activityData], status: true, message: '' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}
