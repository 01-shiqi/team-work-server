$('#model').attr('disabled', true)
$('#workType').attr('disabled', true)
$('#workObject').attr('disabled', true)
$('#workPlace').attr('disabled', true)

function getOptionData(optionIndex, dataName) {
    let data = $('#task option:eq(' + optionIndex + ')').data(dataName)
    return data
}

/**
 * 选择的任务修改后，修改相应的其他选项
 */
$("#task").bind("change", function(){
    let index = $("#task").get(0).selectedIndex
    setSelect2Value('#model', getOptionData(index, 'model'))
    setSelect2Value('#workType', getOptionData(index, 'type'))
    setSelect2Value('#workObject', getOptionData(index, 'work-object'))
    setSelect2Value('#workPlace', getOptionData(index, 'work-place'))
})