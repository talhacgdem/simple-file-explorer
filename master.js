const dirSpan = document.getElementById("directory")
const mainEl = document.getElementsByTagName("main").item(0)
const mainJQ = $('main')
const backBtn = $('#back')
const notify = $('#notify')
const createFolderBtn = $('#createFolderBtn')
const folderName = $('#folderName')
let directory = [];
getFiles()

mainJQ.on('dblclick', '.folder', function (e){
    directory.push(e.target.parentNode.getAttribute('data-dir'))
    getFiles()
})

mainJQ.on('click', '.trash-btn', function (e){
    let dir = e.target.parentNode.getAttribute('data-dir')
    console.log(dir)
    $.ajax({
        url: "manager.php",
        method: "post",
        data: {dir:  getDirectoryString(), delete:dir}
    }).done(function (data) {
        setNotify(data.status, data.msg)
        getFiles()
    }).fail(function (er){
        console.log(er)
        setNotify(false, "ERROR delete()" + er.toString())
    });
})

function backBtnSett(){
    if (directory.length > 0){
        if (backBtn.hasClass("disable"))
            backBtn.removeClass("disable")
    }else{
        if (!backBtn.hasClass("disable"))
            backBtn.addClass("disable")
    }
}
backBtn.on('click', function (){
    if (directory.length > 0) {
        directory.pop()
        getFiles()
    }
})

function uploadFile(e){
    let dir = getDirectoryString()
    let formData = new FormData();
    formData.append("file", e.files[0]);
    formData.append("dir", dir);
    $.ajax({
        url: "manager.php",
        method: "post",
        data: formData,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
    }).done(function (data) {
        e.value = ""
        setNotify(data.status, data.msg)
        getFiles()
    }).fail(function (er){
        setNotify(false, "ERROR uploadFile() -> " + er.toString())
    });
}
function getDirectoryString(){
    let url = ""
    $.each(directory, function (k,v){ url += v + "/" })
    return url;
}
function getFiles(){
    let dir = getDirectoryString()
    dirSpan.innerText = "explorer/" + dir
    mainEl.innerHTML = ""
    $.ajax({
        url: "manager.php",
        method: "post",
        data: {dir: dir}
    }).done(function (data) {
        $.each(data, function (k,v){
            mainEl.append(createFileOrFolder(v))
        })
        backBtnSett()
    }).fail(function (er){
        setNotify(false, "ERROR getFiles()" + er.toString())
    });
}
function createFileOrFolder(object) {
    let div = document.createElement("div")
    div.classList.add(object.class)
    div.setAttribute('data-dir', object.name)
    let trashBtn = document.createElement("span")
    trashBtn.classList.add("trash-btn", "text-danger")
    trashBtn.innerHTML = '<i class="material-icons">delete</i>'
    trashBtn.setAttribute('data-dir', object.name)
    let i = document.createElement("i")
    i.classList.add("material-icons")
    i.innerText = object.class === "file" ? "description" : "folder"
    let h1 = document.createElement("h1")
    h1.innerText = object.name.length > 15
        ? object.name.substring(0, 7) + "..." + object.name.substring(object.name.length - 5, object.name.length)
        : object.name
    let date = document.createElement("div")
    date.classList.add("date")
    date.innerText = object.edit
    div.append(i, h1, date, trashBtn)
    return div
}

function setNotify(type, msg){
    let div = document.createElement("div")
    div.classList.add("alert")
    type ? div.classList.add("success") : div.classList.add("danger")
    div.innerText = msg
    notify.append(div)
    setTimeout(function (){
        notify.html("")
    }, 1500)
}

createFolderBtn.on('click', function (){
    let dir = getDirectoryString()
    $.ajax({
        url: "manager.php",
        method: "post",
        data: {dir: dir, createFolder: folderName.val()}
    }).done(function (data) {
        folderName.val("")
        setNotify(data.status, data.msg)
        getFiles()
    }).fail(function (er){
        setNotify(false, "ERROR createFolder()" + er.toString())
    });
});
