function getWorklog(){
    let worklog = {
        workDate: $('#worklogDate').val(),
        workBeginTime: $('#workBeginTime').val(),
        workTimeLength: $('#workTimeLength').val(),
        workType: $('#workType').val(), 
        model: $('#model').val(),
        workPlace: $('#workPlace').val(), 
        workObject: $('#workObject').val(), 
        workContent: $('#workContent').val(),
        taskID: $('#task').val(), 
        taskProgress: $('#taskProgress').val()
    }
    
    return worklog
}


/**
 * 计算日期间隔的天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcDateDiff(beginDate, endDate) {
    if(beginDate == '' || endDate == '') {
        return
    }
    let beginDateTime = new Date(beginDate.replace(/\-/g, "\/"))
    let endDateTime = new Date(endDate.replace(/\-/g, "\/"))

    let diffMilliseconds = endDateTime - beginDateTime
    let diff = Math.abs(diffMilliseconds / 86400000 + 1)
    return diff
}

/**
 * 计算两个日期间的工作日天数
 * @param {*} beginDate 
 * @param {*} endDate 
 */
function calcWorkDayDiff(beginDate, endDate) {
    //起始日期，/pattern/是正则表达式的界定符，pattern是要匹配的内容，只用于第一个符号的匹配，g为全局匹配标志
    var beginDate = new Date(beginDate.replace(/\-/g, "\/"))
    //结束日期
    var endDate = new Date(endDate.replace(/\-/g, "\/"))
    //日期差值,即包含周六日、以天为单位的工时，86400000=1000*60*60*24.
    var workDayVal = (endDate - beginDate)/86400000 + 1
    //工时的余数
    var remainder = workDayVal % 7
    //工时向下取整的除数
    var divisor = Math.floor(workDayVal / 7)
    var weekendDay = 2 * divisor

    //起始日期的星期，星期取值有（1,2,3,4,5,6,0）
    var nextDay = beginDate.getDay()
    //从起始日期的星期开始 遍历remainder天
    for(var tempDay = remainder; tempDay>=1; tempDay--) {
        //第一天不用加1
        if(tempDay == remainder) {
            nextDay = nextDay + 0
        } else if(tempDay != remainder) {
            nextDay = nextDay + 1
        }
        //周日，变更为0
        if(nextDay == 7) {
            nextDay = 0
        }
    
        //周六日
        if(nextDay == 0 || nextDay == 6) {
            weekendDay = weekendDay + 1
        }
    }
    //实际工时（天） = 起止日期差 - 周六日数目。
    workDayVal = workDayVal - weekendDay
    return workDayVal
}

/**
 * 删除确认提示
 * @param {*} count 
 */
function confirmDelete(count, message, func) {
    swal({
        title: "删除确认",
        text: "确认要删除选中的" + count + "条记录吗？" + (message == null ? "" : message),
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        closeOnConfirm: true,
        closeOnCancel: true
    }, func)
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

/**
 * 判断selector中是否存在html为value的option
 */
function existOption(selector, value) {
    let box = $(selector).find('option')
    let exist = false
    for(let i=0; i<box.length; i++){
        if($(selector).find('option').eq(i).html() == value) {
            exist = true
        }
    }
    return exist
}

/* 
 * 为select2控件的输入区域设置值
 */
function setSelect2Value(selector, value){

    if(value === null || value === undefined || value === '') {
        return
    }

    // 如果值不在select的列表中，则先把值添加至列表
    if(!existOption(selector, value)) {
        $(selector).append("<option value='"+ value +"' selected>"+ value +"</option>")
        $(selector).trigger('change')
    }
    
    $(selector).val(value)
    $(selector).trigger('change')
}

/**
 * 为日期控件设置值
 * @param {*} selector 
 * @param {*} value 
 */
function setDatePickerValue(selector, value) {
    $(selector).datepicker('setDate', value)
}

/**
 * 初始化日期选择器
 */
function initDatePicker() {
    $('.datepicker').datepicker({
        language: "zh-CN",
        weekStart: 1,
        todayBtn: true,
        todayHighlight: true,
        autoclose: true,
        format: 'yyyy-mm-dd',
        daysOfWeekHighlighted: '0, 6'
    })
}

// 初始化编辑对话框
function initEditDialog() {
    // 对话框加载完成后的事件
    $('.editDialog').on('shown.bs.modal', function() {
        $('.customSelect').select2({ tags: false })
        $('.customSelect-tags').select2({ tags: true })
    })
}

initDatePicker()
initEditDialog()

$('.customSelect').select2({ tags: false })
$('.customSelect-tags').select2({ tags: true })


/**
 * 绑定输入框输入事件，如果有输入，则取消红色边框显示
 */
$(".input-no-empty").bind("input propertychange change",function(event) {
    if($(this).val() != '') {
        $(this).removeClass('is-invalid')
    }
})