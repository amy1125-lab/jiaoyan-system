//====================全局存储KEY定义====================
const DB_KEY = {
    user: "sys_user_list",
    plan: "sys_plan_list",
    task: "sys_task_list",
    anno: "sys_anno_list",
    research: "sys_research_list",
    listen: "sys_listen_list",
    course: "sys_course_list",
    template: "sys_template_list",
    tool: "sys_tool_list",
    ref: "sys_ref_list",
    reflection: "sys_reflection_list"
};
let nowUser = null;
let selectSourceArr = [];

//====================本地存储封装====================
function getStorage(key) {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}
function setStorage(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

//初始化管理员账号 admin/123456
(function initAdmin() {
    let userArr = getStorage(DB_KEY.user);
    if (userArr.length === 0) {
        userArr.push({ account: "admin", pwd: "123456", name: "赖悦文" });
        setStorage(DB_KEY.user, userArr);
    }
})();

//====================通用下载CSV公共方法====================
function downloadFile(content, fileName) {
    let blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    let a = document.createElement("a");
    a.href = URL.createObject(blob);
    a.download = fileName;
    a.click();
}

//====================登录注册相关====================
//密码显隐切换
function togglePwd(id) {
    let input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}
//页面切换
function goReg() {
    document.getElementById("login").style.display = "none";
    document.getElementById("reg").style.display = "block";
    document.getElementById("reset").style.display = "none";
}
function goLogin() {
    document.getElementById("login").style.display = "block";
    document.getElementById("reg").style.display = "none";
    document.getElementById("reset").style.display = "none";
}
function goReset() {
    document.getElementById("login").style.display = "none";
    document.getElementById("reg").style.display = "none";
    document.getElementById("reset").style.display = "block";
}
//登录
function login() {
    let acc = document.getElementById("login_user").value.trim();
    let pwd = document.getElementById("login_pwd").value.trim();
    let userList = getStorage(DB_KEY.user);
    let user = userList.find(item => item.account === acc && item.pwd === pwd);
    if (!user) return alert("账号或密码错误！");
    nowUser = user;
    document.getElementById("login").style.display = "none";
    document.getElementById("sysMain").style.display = "block";
    document.getElementById("topUserName").innerHTML = `登录用户：${user.name} <span class="role-tag">普通授课权限</span>`;
    initAllSelectOpt();
    renderAllTable();
    updateHomeStats();
}
//注册账号
function register() {
    let acc = document.getElementById("reg_user").value.trim();
    let pwd = document.getElementById("reg_pwd").value.trim();
    if (!acc || pwd.length < 6) return alert("账号不可为空，密码最少6位！");
    let list = getStorage(DB_KEY.user);
    if (list.some(s => s.account === acc)) return alert("该账号已被注册！");
    list.push({ account: acc, pwd: pwd, name: acc });
    setStorage(DB_KEY.user, list);
    alert("注册成功，请登录！");
    goLogin();
}
//重置密码
function resetPwd() {
    let acc = document.getElementById("reset_user").value.trim();
    let newPwd = document.getElementById("reset_new_pwd").value.trim();
    let confirmPwd = document.getElementById("reset_confirm_pwd").value.trim();
    if (newPwd !== confirmPwd) return alert("两次输入密码不一致！");
    let list = getStorage(DB_KEY.user);
    let obj = list.find(s => s.account === acc);
    if (!obj) return alert("账号不存在！");
    obj.pwd = newPwd;
    setStorage(DB_KEY.user, list);
    alert("密码重置完成！");
    goLogin();
}
//退出登录
function logout() {
    nowUser = null;
    document.getElementById("sysMain").style.display = "none";
    goLogin();
}

//====================侧边菜单====================
function toggleMenu(id) {
    let dom = document.getElementById(id);
    dom.style.display = dom.style.display === "none" ? "block" : "none";
}
function switchModule(id) {
    document.querySelectorAll(".content-panel").forEach(el => el.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("active"));
    event.target.closest(".menu-item").classList.add("active");
}

//====================下拉框初始化(课程联动：听评课、教学反思)====================
function initAllSelectOpt() {
    let courseList = getStorage(DB_KEY.course);
    let optHtml = `<option value="all">全部课程</option>`;
    courseList.forEach(item => optHtml += `<option value="${item.id}">${item.courseName}</option>`);
    let refSel = document.getElementById("refFilterCourse");
    let listenSel = document.getElementById("listenCourseFilter");
    let listenAddSel = document.getElementById("listenCourse");
    if(refSel) refSel.innerHTML = optHtml;
    if(listenSel) listenSel.innerHTML = optHtml;
    if(listenAddSel) listenAddSel.innerHTML = optHtml;
}

//更新首页统计数据
function updateHomeStats(){
    document.getElementById("planCount").innerText = getStorage(DB_KEY.plan).length;
    document.getElementById("taskCount").innerText = getStorage(DB_KEY.task).length;
    document.getElementById("courseCount").innerText = getStorage(DB_KEY.course).length;
    document.getElementById("researchCount").innerText = getStorage(DB_KEY.research).length;
}

//全页面表格统一渲染入口
function renderAllTable() {
    renderPlan();
    renderTask();
    renderAnno();
    renderResearch();
    renderListen();
    renderCourse();
    renderTemplate();
    renderTool();
    renderRef();
    renderReflection();
}

//====================1、教学计划模块====================
function addPlanFromCalendar() {
    document.getElementById("planName").value = "";
    document.getElementById("planStart").value = "";
    document.getElementById("planEnd").value = "";
    document.getElementById("planContent").value = "";
}
function savePlan() {
    let name = document.getElementById("planName").value.trim();
    let s = document.getElementById("planStart").value;
    let e = document.getElementById("planEnd").value;
    let cont = document.getElementById("planContent").value.trim();
    if (!name || !s || !e) return alert("计划名称、起止时间必填！");
    let arr = getStorage(DB_KEY.plan);
    arr.push({ id: Date.now(), planName: name, start: s, end: e, content: cont, check: false });
    setStorage(DB_KEY.plan, arr);
    renderPlan();
    addPlanFromCalendar();
    updateHomeStats();
}
function renderPlan() {
    let arr = getStorage(DB_KEY.plan);
    let html = "";
    arr.forEach(item => {
        html += `<tr>
            <td><input type="checkbox" ${item.check ? "checked" : ""} data-id="${item.id}" onclick="checkPlan(${item.id})"></td>
            <td>${item.planName}</td>
            <td>${item.start} ~ ${item.end}</td>
            <td>正常</td><td>-</td>
        </tr>`;
    });
    document.getElementById("planTableBody").innerHTML = html;
}
function checkPlan(id) {
    let arr = getStorage(DB_KEY.plan);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.plan, arr);
}
function deleteSelectedPlan() {
    let arr = getStorage(DB_KEY.plan).filter(s => !s.check);
    setStorage(DB_KEY.plan, arr);
    renderPlan();
    updateHomeStats();
}
function exportPlanTable() {
    let arr = getStorage(DB_KEY.plan);
    let csv = "计划名称,开始时间,结束时间,计划内容\n";
    arr.forEach(i => csv += `${i.planName},${i.start},${i.end},"${i.content}"\n`);
    downloadFile(csv, "教学计划.csv");
}

//====================2、任务分派模块====================
function changeAssignType() {
    let val = document.getElementById("assignType").value;
    document.getElementById("singleUserRow").style.display = val === "single" ? "flex" : "none";
    document.getElementById("multiUserRow").style.display = val === "multi" ? "flex" : "none";
}
function newTask() {
    document.getElementById("taskContent").value = "";
    document.getElementById("taskStart").value = "";
    document.getElementById("taskDeadline").value = "";
}
function submitTask() {
    let cont = document.getElementById("taskContent").value.trim();
    let s = document.getElementById("taskStart").value;
    let d = document.getElementById("taskDeadline").value;
    if (!cont || !s || !d) return alert("任务内容、起止时间不能为空！");
    let arr = getStorage(DB_KEY.task);
    arr.push({ id: Date.now(), content: cont, start: s, deadline: d, user: nowUser.name, check: false });
    setStorage(DB_KEY.task, arr);
    renderTask();
    newTask();
    updateHomeStats();
}
function renderTask() {
    let arr = getStorage(DB_KEY.task);
    let h = "";
    arr.forEach(i => {
        h += `<tr>
        <td><input type="checkbox" ${i.check?"checked":""} onclick="checkTask(${i.id})"></td>
        <td>${i.content}</td><td>${i.start}</td><td>${i.deadline}</td>
        <td>${i.user}</td><td>无附件</td><td>进行中</td>
        </tr>`;
    });
    document.getElementById("taskTableBody").innerHTML = h;
}
function checkTask(id) {
    let arr = getStorage(DB_KEY.task);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.task, arr);
}
function deleteSelectedTask() {
    let arr = getStorage(DB_KEY.task).filter(s => !s.check);
    setStorage(DB_KEY.task, arr);
    renderTask();
    updateHomeStats();
}
function exportTaskTable() {
    let arr = getStorage(DB_KEY.task);
    let csv = "任务内容,开始时间,截止时间,负责人\n";
    arr.forEach(i => csv += `${i.content},${i.start},${i.deadline},${i.user}\n`);
    downloadFile(csv, "任务清单.csv");
}

//====================3、部门公告====================
function newAnnouncement() {
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";
}
function publishingAnnouncement() {
    let t = document.getElementById("announcementTitle").value.trim();
    let c = document.getElementById("announcementContent").value.trim();
    if (!t || !c) return alert("公告标题与正文不能为空！");
    let arr = getStorage(DB_KEY.anno);
    arr.push({ id: Date.now(), title: t, content: c, time: new Date().toLocaleString(), check: false });
    setStorage(DB_KEY.anno, arr);
    renderAnno();
    newAnnouncement();
}
function renderAnno() {
    let arr = getStorage(DB_KEY.anno);
    let h = "";
    arr.forEach(i => {
        h += `<tr>
        <td><input type="checkbox" ${i.check?"checked":""} onclick="checkAnno(${i.id})"></td>
        <td>${i.title}</td><td>${i.time}</td><td>未阅读</td><td></td>
        </tr>`;
    });
    document.getElementById("announcementTableBody").innerHTML = h;
}
function checkAnno(id) {
    let arr = getStorage(DB_KEY.anno);
    let o = arr.find(s => s.id === id);
    o.check = !o.check;
    setStorage(DB_KEY.anno, arr);
}
function deleteSelectedAnnouncement() {
    let arr = getStorage(DB_KEY.anno).filter(s => !s.check);
    setStorage(DB_KEY.anno, arr);
    renderAnno();
}
function exportAnnouncementTable() {
    let arr = getStorage(DB_KEY.anno);
    let csv = "公告标题,发布时间,公告内容\n";
    arr.forEach(i => csv += `${i.title},${i.time},"${i.content}"\n`);
    downloadFile(csv, "部门公告.csv");
}

//====================4、教研活动====================
function openAddResearch() {
    document.getElementById("resTitle").value = "";
    document.getElementById("resCate").value = "校内教研";
    document.getElementById("resTime").value = "";
    document.getElementById("editResId").value = "";
}
function saveResearch() {
    let title = document.getElementById("resTitle").value.trim();
    let cate = document.getElementById("resCate").value;
    let rtime = document.getElementById("resTime").value;
    let eid = document.getElementById("editResId").value;
    if (!title || !rtime) return alert("主题、活动日期必填！");
    let arr = getStorage(DB_KEY.research);
    if(eid){
        let item = arr.find(x=>x.id==eid);
        item.title=title;item.cate=cate;item.time=rtime;
    }else{
        arr.push({id:Date.now(),title,cate,time:rtime,user:nowUser.name,fileList:[],check:false});
    }
    setStorage(DB_KEY.research,arr);
    renderResearch();openAddResearch();
    updateHomeStats();
}
function renderResearch(filter=null){
    let list=filter||getStorage(DB_KEY.research);
    let html="";
    list.forEach(i=>{
        html+=`<tr><td><input type="checkbox" ${i.check?'checked':''} onclick="checkRes(${i.id})"></td>
        <td>${i.title}</td><td>${i.cate}</td><td>${i.time}</td><td>${i.user}</td>
        <td>${i.fileList.length>0?'<button class="blue-btn small">附件</button>':'无'}</td>
        <td><button onclick="openPreviewRes(${i.id})" class="gray-btn small">查看</button></td></tr>`;
    });
    document.getElementById("researchTableBody").innerHTML=html;
}
function checkRes(id){
    let arr=getStorage(DB_KEY.research);
    let o=arr.find(x=>x.id==id);o.check=!o.check;setStorage(DB_KEY.research,arr);renderResearch();
}
function batchDelResearch(){
    let arr=getStorage(DB_KEY.research).filter(x=>!x.check);setStorage(DB_KEY.research,arr);renderResearch();
    updateHomeStats();
}
function filterResearch(){
    let c=document.getElementById("resCateFilter").value;
    let d=document.getElementById("resDateFilter").value;
    let all=getStorage(DB_KEY.research);
    let res=all
