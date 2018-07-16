// 获取 表格单元格的内容
function getTableCellData(trID, tdIndex) {
    return $("#"+ trID + " .td" + tdIndex).html()
}

// 获取 表格单元格的ID
function getTableCellID(trID, tdIndex) {
    return $("#"+ trID + " .td" + tdIndex).attr('data-id')
}

// 获取 表格 行的属性数据
function getTableRowData(trID, dataID) {
    let data = $("#"+ trID).attr(dataID)
    return (!data || data == 'null') ? '' : data
}

//- 全选或取消全选
$('#cb-select-all').click(function(){

    var allChecked = this.checked
    $(".cb-task-item").each(function(){
        this.checked = allChecked
    })
})