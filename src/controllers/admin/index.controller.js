
const reservationModel = require("../../models/reservation.model");
const userModel = require("../../models/User");
const houseModel = require("../../models/house.model");
const moment = require("moment/moment");
const VIEW=require("../../constants/viewName");
const ROLE=require("../../constants/role")
class AdminController {
    index(req, res, next) {
        let avatar = req.cookies.user_avatar;
        reservationModel.find().then((item) => {
            const initialValue = 0;
            const reduceAr = item.map((item) => item.value);
            const createdDays = item.map((item) => moment(item.created_at).format("dd/M").toString());;
            const values = item.map((item) => parseInt(item.value));
            const sumWithInitial = reduceAr.reduce((accumulator, currentValue) => accumulator + parseInt(currentValue), initialValue);
            userModel.find({}).then((us) => {
                const roleCount = [0, 0, 0];
                const roleName = ["admin", "host", "user"];
                us.forEach(user => {
                    if (user.role === ROLE.ADMIN) {
                        roleCount[0]++;
                    } else if (user.role === ROLE.HOST) {
                        roleCount[1]++;
                    } else if (user.role === ROLE.USER) {
                        roleCount[2]++;
                    }
                });
                let counter = us.length;
                houseModel.count({}).then((count) => {

                    res.render(VIEW.ADMIN_PAGE, { roleCount, roleName, createdDays: createdDays, values: values, indexPage: true, hideNavigation: true, avatar: avatar, totalVenue: sumWithInitial, userAmount: counter, roomAmount: count });
                })

            })
        }).catch((err) => {
            console.log(err)
        })

    }
    roomsRequest(req, res, next) {
        let avatar = req.cookies.user_avatar;
        houseModel.find({ validByAdmin: false }).populate("host").then((count) => {

            count = count.map((i) => i.toObject());
            res.render(VIEW.ADMIN_PAGE, { avatar: avatar, roomsRequest: true, rooms: count });
        })
    }
    mostvisit(req, res, next) {
        houseModel.find({}).sort({ Visittime: -1 }).limit(20).then(list => {

            list = list.map((i) => i.toObject());
            res.render(VIEW.ADMIN_PAGE, { list, hideNavigation: true, mostvisit: true });

        }).catch((err) => { console.log(err) });
    }
    contractlist(req, res, next) {
        let avatar = req.cookies.user_avatar;
        reservationModel.find().populate("host").populate("cus").populate("room").then((item) => {

            item = item.map((i) => i.toObject());

            res.render(VIEW.ADMIN_PAGE, { hideNavigation: true, avatar: avatar, contractlist: true, list: item });
        }).catch((err) => {
            console.log(err)
        })

    }

    roomlist(req, res, next) {
        let avatar = req.cookies.user_avatar;
        houseModel.find({}).populate("host").then((count) => {
            count = count.map((i) => i.toObject());
            res.render(VIEW.ADMIN_PAGE, { hideNavigation: true, avatar: avatar, roomlist: true, rooms: count });
        })

    }

    message(req, res, next) {
        let avatar = req.cookies.user_avatar;
        reservationModel.find().then((item) => {
            const initialValue = 0;
            const reduceAr = item.map((item) => item.value);

            const sumWithInitial = reduceAr.reduce((accumulator, currentValue) => accumulator + parseInt(currentValue), initialValue);
            userModel.count({}).then((counter) => {
                houseModel.count({}).then((count) => {

                    res.render(VIEW.ADMIN_PAGE, { hideNavigation: true, avatar: avatar, totalVenue: sumWithInitial, userAmount: counter, roomAmount: count, message: true });
                })

            })
        }).catch((err) => {
            console.log(err)
        })
    }
    roomlistDelete(req, res, next) {

        houseModel.deleteOne({ _id: req.params.id }).then(() => {
            res.redirect("/admin/roomlist");
        })
            .catch((err) => { console.log(err) });
    }


    roomsRequestAcept(req, res, next) {

        houseModel.findOne({ _id: req.params.id }).then((room) => {
            room.validByAdmin = true;
            room.save();
            res.redirect("/admin/roomsrequest");

        }).catch((err) => { console.log(err) });
    }

}
module.exports = new AdminController();