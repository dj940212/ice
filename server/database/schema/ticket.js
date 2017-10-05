const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TicketSchema = new mongoose.Schema({
    name: String,
    ticket: String,
    expires_in: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
})

TicketSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    }else {
        this.meta.updatedAt = Date.now()
    }

    next()
})

TicketSchema.statics = {
    async getAccessTicket() {
        const ticket = await this.findOne({
            name: 'ticket'
        }).exec()

        if (ticket && ticket.ticket) {
            ticket.ticket = ticket.ticket
        }

        return ticket
    },

    async saveAccessTicket(data) {
        console.log("saveAccessticket")
        let ticket = await this.findOne({
            name: 'ticket'
        }).exec()

        if (ticket) {
            ticket.ticket = ticket
            ticket.expires_in = data.expires_in
        }else {
            ticket = new ticket({
                name: 'ticket',
                ticket: data.ticket,
                expires_in: data.expires_in
            })
        }

        await ticket.save()

        return data
    }
}

export default mongoose.model('ticket', TicketSchema)