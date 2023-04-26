const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const ActivityContentSchedulerSchema = new mongoose.Schema({
    contentSchedulerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fields: [String],
    activityName: {
        type: String,
        enum: ['Created', 'Updated'],
        default: 'Created'
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
ActivityContentSchedulerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ActivityContentScheduler', ActivityContentSchedulerSchema, 'ActivityContentScheduler')