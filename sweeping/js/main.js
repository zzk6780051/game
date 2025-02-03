function bind_buttons(){
    $('button').click(function(e){
        var target = $(e.target)
        // 清空网格
        var container = $('#id-div-container').empty()
        // 停止计时
        control_time('stop')
        if (target.text() == '初级模式') {
            var array = initial(10)
            bindSingle(array)
        } else if (target.text() == '中级模式') {
            var array = initial(15)
            bindSingle(array)
        }else if (target.text() == '高级模式') {
            var array = initial(20)
            bindSingle(array)
        }
    })
}

// 以下bindSingle()
function click_boom(){
    // 显示出所有雷
    mark_all_boom()
    // 显示出所有数字
    $('.number').removeClass('hide')
    // 隐藏所有的红旗
    $('.flag').remove()
    // 停止计时
    control_time('stop')
    // 提示
    alert('你输了')
}

function click_zero(target, number, array, x, y){
    // 显示自己
    number.removeClass('hide')
    // 显示该格的八个按钮并添加递归标志zero
    number.addClass('zero')
    no_together(target)
    show_around(array, x, y)
}

function click_number(number, target){
    // 显示数字
    number.removeClass('hide')
    judge_win()
    no_together(target)
}

function get_index(target) {
    var a = target.attr('id')
    var b = a.split('-')
    var len = b.length
    var x = parseInt(b[len-2])
    var y = parseInt(b[len-1])
    return [x, y]
}

function no_together(single){
    var b = single.children()
    var tags_container = $('#id-showmark')
    var n = parseInt(tags_container.text())
    if (b.length == 2) {
        var a = $(b[1])
        a.remove()
        tags_container.text(`${n+1}`)
    }
}

function mark_flag(item){
    // 获取标志的容器
    var tags_container = $('#id-showmark')
    var a = parseInt(tags_container.text())
    if(item.children().hasClass('hide')){
        if (!item.hasClass('tagged') && a > 0) {
            var t = `
            <img class='flag' src="./image/红旗.png" alt="1">
            `
            item.append(t)
            item.addClass('tagged')
            tags_container.text(a-1)
        } else if(item.hasClass('tagged')){
            item.removeClass('tagged')
            item.children().last().remove()
            tags_container.text(`${a+1}`)
        }else if (a <= 0) {
            judge_win()
            alert('没有标志了')
        }
    }
}

function plus2(array, x, y){
    var n = array.length
    if (x >=0 && x < n && y >= 0 && y < n) {
        var single = $(`#id-div-${x}-${y}`)
        var a = $(single.children())
        // 判断递归标志
        var tag = a.hasClass('zero')
        if (a.text() == '0' && !tag) {
            a.removeClass('hide')
            a.addClass('zero')
            show_around(array, x, y)
            no_together(single)
        } else if(array[x][y] != 0 && array[x][y] != 9) {
            a.removeClass('hide')
            no_together(single)
        }
    }
}

function show_around(array, x, y){
    if (array[x][y] == 0) {
        plus2(array, x - 1, y - 1)
        plus2(array, x - 1, y)
        plus2(array, x - 1, y + 1)
        // 上下 2 个
        plus2(array, x, y - 1)
        plus2(array, x, y + 1)
        // 右边 3 个
        plus2(array, x + 1, y - 1)
        plus2(array, x + 1, y)
        plus2(array, x + 1, y + 1)
    }
}

function judge_win(){
    var numbers = $('.number')
    var tag = 1
    for (var i = 0; i < numbers.length; i++) {
        var a = $(numbers[i])
        if (a.text() == '9' || !a.hasClass('hide')) {
            continue
        } else if(a.text() != '9' && a.hasClass('hide')){
            tag = 0
            break
        }
    }
    if (tag == 1) {
        alert('You Win!!!')
    }
}

function begin_time(){
    var item = $('#id-span-time')
    let time = parseInt(item.text())
    time += 1
    item.text(`${time}`)
}

function control_time(tag){
    var item = $('#id-span-time')
    if (tag == 'start') {
        if (!item.hasClass('start')) {
            item.addClass('start')
            // timer必须设置成全局变量
            timer = setInterval(begin_time, 1000)
        }else if (item.hasClass('start')) {
            console.log('有计时器了')
        }
    } else if (tag == 'stop' && item.hasClass('start')) {
        clearInterval(timer)
        item.removeClass('start')
    }
}

function mark_all_boom(){
    var pic_boom = `
        <img src='./image/boom2.png' class='boom'>
        `
    var numbers = $('.number')
    for (var i = 0; i < numbers.length; i++) {
        var a = numbers[i]
        a = $(a)
        if (a.text() == '9') {
            a.html(pic_boom)
        }
    }
}

function bindSingle(array){
    $('.single').mousedown(function(e){
        // 开始计时器
        control_time('start')
        // 获取点击的number、target统一为single、span为number(不考虑点击炸弹的情况)
        var target = $(e.target)
        if (target.hasClass('number') || target.hasClass('flag')) {
            target = target.parent()
        }
        var number = $(target.children()[0])
        var value = number.text()
        // 在后台输出number
        console.log(value)
        // 获取点击single的id
        var [x, y] = get_index(target)
        // 绑定鼠标左键和右键
        if (e.which == 1) {
            if (value == 9) {
                click_boom()
            } else if (value == 0) {
                click_zero(target, number, array, x, y)
            } else if(value > 0 && value < 9){
                click_number(number, target)
             }
        } else if (e.which == 3) {
            // 将标记显示在格子上
            mark_flag(target)
        }
    })
}

function initial_red_flags(n){
    // 获取标志的容器
    var tags_container = $('#id-showmark')
    // 设置标志的数量
    tags_container.text(n*n/5)
}

function export_to_web(array){
    var lines = $('.line')
    for (var i = 0; i < lines.length; i++) {
        for (var j = 0; j < lines.length; j++) {
            var id = `#id-div-${i}-${j}`
            $(id).find('span').text(array[i][j])
        }
    }
}

// 以下add_square()
function array_line(n){
    let lst = []
    for (var i = 0; i < n; i++) {
        lst.push(0)
    }
    return lst
}

function array_square(n){
    let lst = []
    for (var i = 0; i < n; i++) {
        lst.push(array_line(n))
    }
    return lst
}

function boom_square(array, boom){
    for (var i = 0; i < boom;) {
        let x = Math.floor(Math.random() * array.length)
        let y = Math.floor(Math.random() * array.length)
        if (array[x][y] != 9) {
            array[x][y] = 9
            i++
            // log('ok')
        }
    }
}

function plus1(square, i, j){
    let n = square.length
    if (i >= 0 && i < n & j >= 0 && j < n) {
        if (square[i][j] != 9) {
            square[i][j] += 1
        }
    }
}

function marked_around(square, i, j){
    if (square[i][j] === 9) {
        plus1(square, i - 1, j - 1)
        plus1(square, i - 1, j)
        plus1(square, i - 1, j + 1)
        //
        plus1(square, i, j - 1)
        plus1(square, i, j + 1)
        //
        plus1(square, i + 1, j - 1)
        plus1(square, i + 1, j)
        plus1(square, i + 1, j + 1)
    }
}

function marked_square(square){
    // 双重循环方阵
    for (var i = 0; i < square.length; i++) {
        let line = square[i]
        for (var j = 0; j < line.length; j++) {
            // 最关键的函数-marked_around
            marked_around(square, i, j)
        }
    }
    return square
}

function createdArray(n){
    let array = array_square(n)
    // 设置炸弹的数量，并随机分布位置
    let boom = n * n / 5
    boom_square(array, boom)
    // 给炸弹周围标记数量
    let marked_array = marked_square(array)
    return marked_array
}

function forbidRightShow(){
    var container = $('#id-div-container')
    container.contextmenu(function(e){
        return false
    })
}

function template_single(x, y){
    var t = `
            <div class="single" id="id-div-${x}-${y}">
                <span class='number hide'></span>
            </div>

            `
    return t
}

function template_line(){
     var t = `
            <div class="line">

             </div>
             `
    return t
}

function add_square(n){
    // 先插入n行div
    var str_line = ''
    for (var i = 0; i < n; i++) {
        str_line += template_line()
    }
    $('#id-div-container').append(str_line)

    //  在页面中找到line类，每个插入n个div
    let lines = $('.line')
    for (var i = 0; i < lines.length; i++) {
        var str_single = ''
        for (var j = 0; j < n; j++) {
            str_single += template_single(i, j)
        }
        let a = lines[i]
        $(a).append(str_single)
    }
}

function choice_case(n){
    if (n == 10) {
        $('head').append('<link rel="stylesheet" href="css/class_0.css">')
    }else if (n == 15) {
        $('head').append('<link rel="stylesheet" href="css/class_1.css">')
    }else if (n == 20) {
        $('head').append('<link rel="stylesheet" href="css/class_2.css">')
    }
}

function initial(n){
    // 根据选择的难度设置容器的class
    choice_case(n)
    // 清空计时器
    var item = $('#id-span-time')
    item.text(0)
    // 在页面插入一个10*10矩阵
        // - 先插入10div
        // - 每个div插入10个div
    add_square(n)
    // 禁止鼠标右键点击事件
    forbidRightShow()
    // 雷的数量为n*n/5，直接生成一个包含雷（即9）的数组矩阵
    var array = createdArray(n)
    // 将数组导入页面
    export_to_web(array)
    // 设置红旗(标记)个数（等于雷的个数）
    initial_red_flags(n)
    return array
}

function __main(){
    // 初始页面,初始难度为初级;并返回一个标记了炸弹的数组（9）
    var n = 10
    var array = initial(n)
    // 绑定单个方格
    bindSingle(array)
    // 绑定按钮
    bind_buttons()
}

__main()
