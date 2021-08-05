module.exports = {
    redirectLogin: (req, res, next) => {
        if(!req.session.user){ //If no one is logged in
            res.redirect('/login');
        }else{
            next();
        }
    },
    redirectHome:(req, res, next) => {
        if(req.session.user){ //If there is someone logged in
            res.redirect('/home');
        }else{
            next();
        }
    },
    teacherPermissions:(req, res, next) => {
        if(req.session.user.teacher_account === "no"){ //If account is of a teacher
            res.redirect('/home');
        }else{
            next();
        }
    },
    studentPermissions:(req, res, next) => {
        if(req.session.user.teacher_account === "yes"){ //If account is of a student
            res.redirect('/home');
        }else{
            next();
        }
    }
}
