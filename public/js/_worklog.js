


function checkInput(worklog){

    if(!worklog.taskID){
        showWarning('任务名称不能为空')
        return false
    }


    if(!worklog.workBeginTime){
        showWarning('开始时间不能为空！')
        return false
    }

    if(!worklog.workTimeLength){
        showWarning('工作时长不能为空！')
        return false
    }

    if(parseFloat(worklog.workTimeLength) <= 0) {
        showWarning('工作时长必须为大于零的数！')
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
