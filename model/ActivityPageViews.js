const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const ActivityPageViewsSchema = new mongoose.Schema({
    pageViewsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    activityName: {
        type: String,
        require: true
    },
    details: {
        type: String,
        require: true
    },
    time: {
        type: Date,
        require: true
    },
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
ActivityPageViewsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ActivityPageViews', ActivityPageViewsSchema, 'ActivityPageViews')