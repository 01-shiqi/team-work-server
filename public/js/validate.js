function getWorklog(){
    let worklog = {
        workDate: $('#worklogDate').val(),
        workBeginTime: $('#beginTime').val(),
        workEndTime: $('#endTime').val(),
        workType: $('#workType').val(), 
        model: $('#model').val(),
        workPlace: $('#workPlace').val(), 
        workObject: $('#workObject').val(), 
        workContent: $('#workContent').val(),
    }
    
    return worklog
}


function showWarning(msg){
    $.notify({
            title: "输入错误 : ",
            message: msg,
            icon: 'fa fa-warning' 
        },{
            type: "danger",
            delay: "500"
        });
}

function checkInput(worklog){

    if(!worklog.workBeginTime){
        showWarning('开始时间不能为空！')
        return false
    }

    if(!worklog.workEndTime){
        showWarning('结束时间不能为空！')
        return false
    }

    if(worklog.workEndTime <= worklog.workBeginTime) {
        showWarning('结束时间必须在开始时间之后！')
        return false
    }

    if(!worklog.workType){
        showWarning('工作类型不能为空！')
        return false
    }

    if(!worklog.model){
        showWarning('所属型号不能为空！')
        return false
    }

    if(!worklog.workPlace){
        showWarning('工作对象不能为空！')
        return false
    }

    if(!worklog.workObject){
        showWarning('工作对象不能为空！')
        return false
    }

    if(!worklog.workContent){
        showWarning('工作内容不能为空！')
        return false
    }
    return true
}