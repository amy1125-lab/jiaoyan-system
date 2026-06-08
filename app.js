// ===================== 全局存储 KEY 定义 =====================
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
    reflection: "sys_reflection_list",
    material: "sys_material_list",
    warehouse: "sys_warehouse_list",
    classroom: "sys_classroom_list",
    personnel: "sys_personnel_list",
    studentEval: "sys_student_eval_list",
    satisfaction: "sys_satisfaction_list",
    achievement: "sys_achievement_list",
    analysis: "sys_analysis_list"
};

let nowUser = null;
let selectSourceArr = [];

// ===================== 本地存储通用封装 =====================
function getStorage(key) {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setStorage(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
}

// ===================== 初始化内置账号 =====================
(function initAdmin() {
    let userArr = getStorage(DB_KEY.user);
    if (userArr.length === 0) {
        const initialUsers = [
            { account: "赖悦文", pwd: "12345678", name: "赖悦文", role: "admin", id: 1 },
            { account: "郭超凡", pwd: "12345678", name: "郭超凡", role: "admin", id: 2 },
            { account: "辜雅莹", pwd: "12345678", name: "辜雅莹", role: "user", id: 3 },
            { account: "黄琳", pwd: "12345678", name: "黄琳", role: "user", id: 4 },
            { account: "田靖", pwd: "12345678", name: "田靖", role: "user", id: 5 },
            { account: "罗曼", pwd: "12345678", name: "罗曼", role: "user", id: 6 },
            { account: "周丹霞", pwd: "12345678", name: "周丹霞", role: "user", id: 7 },
            { account: "邓欣禹", pwd: "12345678", name: "邓欣禹", role: "user", id: 8 },
            { account: "孙辰欣", pwd: "12345678", name: "孙辰欣", role: "user", id: 9 }
        ];
        setStorage(DB_KEY.user, initialUsers);
    }
})();

// ===================== 通用 CSV 下载方法 =====================
function downloadFile(content, fileName) {
    let blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    let a = document.createElement("a");
    a.href = URL.createObject(blob);
    a.download = fileName;
    a.click();
}

// ===================== 登录 / 注册 / 重置密码 / 退出 =====================
// 密码显隐切换
function togglePwd(id) {
    let input = document.getElementById(id);
    input.type = input.type === "password" ? "text" : "password";
}

// 页面切换
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

// 登录
function login() {
    let acc = document.getElementById("login_user").value.trim();
    let pwd = document.getElementById("login_pwd").value.trim();
    let userList = getStorage(DB_KEY.user);
    let user = userList.find(item => item.account === acc && item.pwd === pwd);
    if (!user) {
        return alert("账号或密码错误！");
    }

    nowUser = user;
    document.getElementById("login").style.display = "none";
    document.getElementById("sysMain").style.display = "block";
    let roleText = user.role === 'admin' ? '管理员权限' : '普通用户权限';
    document.getElementById("topUserName").innerHTML = `登录用户：${user.name} <span class="role-tag">${roleText}</span>`;

    // 权限控制：管理员显示用户管理菜单
    if (user.role === 'admin') {
        document.getElementById("menu-user").style.display = "block";
    } else {
        document.getElementById("menu-user").style.display = "none";
    }

    initAllSelectOpt();
    renderAllTable();
    updateHomeStats();
}

// 注册
function register() {
    let acc = document.getElementById("reg_user").value.trim();
    let pwd = document.getElementById("reg_pwd").value.trim();
    if (!acc || pwd.length < 6) {
        return alert("账号不可为空，密码最少6位！");
    }
    let list = getStorage(DB_KEY.user);
    if (list.some(s => s.account === acc)) {
        return alert("该账号已被注册！");
    }
    list.push({ account: acc, pwd: pwd, name: acc, role: "user", id: Date.now() });
    setStorage(DB_KEY.user, list);
    alert("注册成功，请登录！");
    goLogin();
}

// 重置密码
function resetPwd() {
    let acc = document.getElementById("reset_user").value.trim();
    let newPwd = document.getElementById("reset_new_pwd").value.trim();
    let confirmPwd = document.getElementById("reset_confirm_pwd").value.trim();
    if (newPwd !== confirmPwd) {
        return alert("两次输入密码不一致！");
    }
    let list = getStorage(DB_KEY.user);
    let obj = list.find(s => s.account === acc);
    if (!obj) {
        return alert("账号不存在！");
    }
    obj.pwd = newPwd;
    setStorage(DB_KEY.user, list);
    alert("密码重置完成！");
    goLogin();
}

// 退出登录
function logout() {
    nowUser = null;
    document.getElementById("sysMain").style.display = "none";
    goLogin();
}

// ===================== 侧边菜单切换 =====================
function toggleMenu(id) {
    let dom = document.getElementById(id);
    dom.style.display = dom.style.display === "none" ? "block" : "none";
}

function switchModule(id) {
    document.querySelectorAll(".content-panel").forEach(el => el.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("active"));
    if (event && event.target) {
        let menuItem = event.target.closest(".menu-item");
        if (menuItem) menuItem.classList.add("active");
    }
}

// ===================== 下拉框初始化（课程联动） =====================
function initAllSelectOpt() {
    let courseList = getStorage(DB_KEY.course);
    let optHtml = `<option value="all">全部课程</option>`;
    courseList.forEach(item => {
        optHtml += `<option value="${item.id}">${item.name}</option>`;
    });
    let refSel = document.getElementById("refFilterCourse");
    let listenSel = document.getElementById("listenCourseFilter");
    let listenAddSel = document.getElementById("listenCourse");
    if (refSel) refSel.innerHTML = optHtml;
    if (listenSel) listenSel.innerHTML = optHtml;
    if (listenAddSel) listenAddSel.innerHTML = optHtml;
}

// ===================== 首页统计数据更新 =====================
function updateHomeStats() {
    let planDom = document.getElementById("planCount");
    let taskDom = document.getElementById("taskCount");
    let courseDom = document.getElementById("courseCount");
    let researchDom = document.getElementById("researchCount");

    if (planDom) planDom.innerText = getStorage(DB_KEY.plan).length;
    if (taskDom) taskDom.innerText = getStorage(DB_KEY.task).length;
    if (courseDom) courseDom.innerText = getStorage(DB_KEY.course).length;
    if (researchDom) researchDom.innerText = getStorage(DB_KEY.research).length;
}

// ===================== 全页面表格统一渲染入口 =====================
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
    renderMaterial();
    renderClassroom();
    renderPersonnel();
    renderStudentEval();
    renderSatisfaction();
    renderAchievement();
    renderAnalysis();
    renderUserTable();
    renderPersonalTask();
    renderProfile();
}

// ===================== 1. 教学计划模块 =====================
function addPlanFromCalendar() {
    let planName = document.getElementById("planName");
    let planStart = document.getElementById("planStart");
    let planEnd = document.getElementById("planEnd");
    let planContent = document.getElementById("planContent");
    if (planName) planName.value = "";
    if (planStart) planStart.value = "";
    if (planEnd) planEnd.value = "";
    if (planContent) planContent.value = "";
}

function savePlan() {
    let name = document.getElementById("planName").value.trim();
    let s = document.getElementById("planStart").value;
    let e = document.getElementById("planEnd").value;
    let cont = document.getElementById("planContent").value.trim();
    if (!name || !s || !e) {
        return alert("计划名称、起止时间必填！");
    }
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
    let tbody = document.getElementById("planTableBody");
    if (tbody) tbody.innerHTML = html;
}

function checkPlan(id) {
    let arr = getStorage(DB_KEY.plan);
    let o = arr.find(s => s.id === id);
    if (o) o.check = !o.check;
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
    arr.forEach(i => {
        csv += `${i.planName},${i.start},${i.end},"${i.content}"\n`;
    });
    downloadFile(csv, "教学计划.csv");
}

// ===================== 2. 任务分派模块 =====================
function changeAssignType() {
    let val = document.getElementById("assignType").value;
    let singleRow = document.getElementById("singleUserRow");
    let multiRow = document.getElementById("multiUserRow");
    if (singleRow) singleRow.style.display = val === "single" ? "flex" : "none";
    if (multiRow) multiRow.style.display = val === "multi" ? "flex" : "none";
}

function newTask() {
    let taskContent = document.getElementById("taskContent");
    let taskStart = document.getElementById("taskStart");
    let taskDeadline = document.getElementById("taskDeadline");
    if (taskContent) taskContent.value = "";
    if (taskStart) taskStart.value = "";
    if (taskDeadline) taskDeadline.value = "";
}

function submitTask() {
    let cont = document.getElementById("taskContent").value.trim();
    let s = document.getElementById("taskStart").value;
    let d = document.getElementById("taskDeadline").value;
    if (!cont || !s || !d) {
        return alert("任务内容、起止时间不能为空！");
    }
    let arr = getStorage(DB_KEY.task);
    arr.push({
        id: Date.now(),
        content: cont,
        start: s,
        deadline: d,
        user: nowUser.name,
        check: false,
        status: "进行中"
    });
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
        <td><input type="checkbox" ${i.check ? "checked" : ""} onclick="checkTask(${i.id})"></td>
        <td>${i.content}</td><td>${i.start}</td><td>${i.deadline}</td>
        <td>${i.user}</td><td>无附件</td><td>${i.status}</td>
        </tr>`;
    });
    let tbody = document.getElementById("taskTableBody");
    if (tbody) tbody.innerHTML = h;
}

function checkTask(id) {
    let arr = getStorage(DB_KEY.task);
    let o = arr.find(s => s.id === id);
    if (o) o.check = !o.check;
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
    arr.forEach(i => {
        csv += `${i.content},${i.start},${i.deadline},${i.user}\n`;
    });
    downloadFile(csv, "任务清单.csv");
}

// ===================== 3. 部门公告模块 =====================
function newAnnouncement() {
    let title = document.getElementById("announcementTitle");
    let content = document.getElementById("announcementContent");
    if (title) title.value = "";
    if (content) content.value = "";
}

function publishingAnnouncement() {
    let t = document.getElementById("announcementTitle").value.trim();
    let c = document.getElementById("announcementContent").value.trim();
    if (!t || !c) {
        return alert("公告标题与正文不能为空！");
    }
    let arr = getStorage(DB_KEY.anno);
    arr.push({
        id: Date.now(),
        title: t,
        content: c,
        time: new Date().toLocaleString(),
        check: false
    });
    setStorage(DB_KEY.anno, arr);
    renderAnno();
    newAnnouncement();
}

function renderAnno() {
    let arr = getStorage(DB_KEY.anno);
    let h = "";
    arr.forEach(i => {
        h += `<tr>
        <td><input type="checkbox" ${i.check ? "checked" : ""} onclick="checkAnno(${i.id})"></td>
        <td>${i.title}</td><td>${i.time}</td><td>未阅读</td><td></td>
        </tr>`;
    });
    let tbody = document.getElementById("announcementTableBody");
    if (tbody) tbody.innerHTML = h;
}

function checkAnno(id) {
    let arr = getStorage(DB_KEY.anno);
    let o = arr.find(s => s.id === id);
    if (o) o.check = !o.check;
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
    arr.forEach(i => {
        csv += `${i.title},${i.time},"${i.content}"\n`;
    });
    downloadFile(csv, "部门公告.csv");
}

// ===================== 4. 教研活动模块 =====================
function openAddResearch() {
    let resTitle = document.getElementById("resTitle");
    let resCate = document.getElementById("resCate");
    let resTime = document.getElementById("resTime");
    if (resTitle) resTitle.value = "";
    if (resCate) resCate.value = "校内教研";
    if (resTime) resTime.value = "";
}

function saveResearch() {
    let title = document.getElementById("resTitle").value.trim();
    let cate = document.getElementById("resCate").value;
    let rtime = document.getElementById("resTime").value;
    if (!title || !rtime) {
        return alert("主题、活动日期必填！");
    }
    let arr = getStorage(DB_KEY.research);
    arr.push({
        id: Date.now(),
        title,
        cate,
        time: rtime,
        user: nowUser.name,
        fileList: [],
        check: false
    });
    setStorage(DB_KEY.research, arr);
    renderResearch();
    openAddResearch();
    updateHomeStats();
}

function renderResearch(filter = null) {
    let list = filter || getStorage(DB_KEY.research);
    let html = "";
    list.forEach(i => {
        html += `<tr>
        <td><input type="checkbox" ${i.check ? 'checked' : ''} onclick="checkRes(${i.id})"></td>
        <td>${i.title}</td><td>${i.cate}</td><td>${i.time}</td><td>${i.user}</td>
        <td>${i.fileList.length > 0 ? '<button class="blue-btn small">附件</button>' : '无'}</td>
        <td><button class="gray-btn small">查看</button></td></tr>`;
    });
    let tbody = document.getElementById("researchTableBody");
    if (tbody) tbody.innerHTML = html;
}

function checkRes(id) {
    let arr = getStorage(DB_KEY.research);
    let o = arr.find(x => x.id == id);
    if (o) o.check = !o.check;
    setStorage(DB_KEY.research, arr);
    renderResearch();
}

function batchDelResearch() {
    let arr = getStorage(DB_KEY.research).filter(x => !x.check);
    setStorage(DB_KEY.research, arr);
    renderResearch();
    updateHomeStats();
}

function filterResearch() {
    let c = document.getElementById("resCateFilter").value;
    let d = document.getElementById("resDateFilter").value;
    let all = getStorage(DB_KEY.research);
    let res = all.filter(x => {
        let f1 = (c == "all" || x.cate == c);
        let f2 = (!d || x.time == d);
        return f1 && f2;
    });
    renderResearch(res);
}

function resetFilterResearch() {
    let cateSel = document.getElementById("resCateFilter");
    let dateSel = document.getElementById("resDateFilter");
    if (cateSel) cateSel.value = "all";
    if (dateSel) dateSel.value = "";
    renderResearch();
}

function batchDownResearch() {
    alert("批量下载附件模拟触发");
}

// ===================== 5. 听评课模块 =====================
function openAddListen() {
    let listenUser = document.getElementById("listenUser");
    let listenCourse = document.getElementById("listenCourse");
    let listenScore = document.getElementById("listenScore");
    let listenRemark = document.getElementById("listenRemark");
    if (listenUser) listenUser.value = nowUser.name;
    if (listenCourse) listenCourse.value = "";
    if (listenScore) listenScore.value = "";
    if (listenRemark) listenRemark.value = "";
}

function saveListenRecord() {
    let user = document.getElementById("listenUser").value.trim();
    let course = document.getElementById("listenCourse").value;
    let score = document.getElementById("listenScore").value;
    let remark = document.getElementById("listenRemark").value.trim();
    if (!user || !course) {
        return alert("听课人、授课课程必填！");
    }
    let arr = getStorage(DB_KEY.listen);
    arr.push({
        id: Date.now(),
        user,
        course,
        score,
        remark,
        time: new Date().toLocaleDateString(),
        check: false
    });
    setStorage(DB_KEY.listen, arr);
    renderListen();
    openAddListen();
}

function renderListen(filter = null) {
    let list = filter || getStorage(DB_KEY.listen);
    let html = "";
    list.forEach(i => {
        html += `<tr>
        <td><input type="checkbox" ${i.check ? 'checked' : ''} onclick="checkListen(${i.id})"></td>
        <td>${i.user}</td><td>${i.course}</td><td>${i.time}</td><td>${i.score || '无'}</td>
        <td>无附件</td><td><button class="gray-btn small">查看</button></td></tr>`;
    });
    let tbody = document.getElementById("listenTableBody");
    if (tbody) tbody.innerHTML = html;
}

function checkListen(id) {
    let arr = getStorage(DB_KEY.listen);
    let o = arr.find(x => x.id == id);
    if (o) o.check = !o.check;
    setStorage(DB_KEY.listen, arr);
    renderListen();
}

function batchDelListen() {
    let arr = getStorage(DB_KEY.listen).filter(x => !x.check);
    setStorage(DB_KEY.listen, arr);
    renderListen();
}

function filterListen() {
    let c = document.getElementById("listenCourseFilter").value;
    let d = document.getElementById("listenDateFilter").value;
    let all = getStorage(DB_KEY.listen);
    let res = all.filter(x => {
        let f1 = (c == "all" || x.course == c);
        let f2 = (!d || x.time == d);
        return f1 && f2;
    });
    renderListen(res);
}

function resetFilterListen() {
    let courseSel = document.getElementById("listenCourseFilter");
    let dateSel = document.getElementById("listenDateFilter");
    if (courseSel) courseSel.value = "all";
    if (dateSel) dateSel.value = "";
    renderListen();
}

function exportListenExcel() {
    let arr = getStorage(DB_KEY.listen);
    let csv = "听课人,课程,日期,评分,备注\n";
    arr.forEach(i => {
        csv += `${i.user},${i.course},${i.time},${i.score||'无'},"${i.remark||'无'}"\n`;
    });
    downloadFile(csv,"听课记录.csv");
}

// ===================== 6. 课程资源库模块 =====================
function submitCourse() {
    let line = document.getElementById("courseLine").value;
    let name = document.getElementById("courseName").value.trim();
    let owner = document.getElementById("courseOwner").value.trim();
    let age = document.getElementById("courseAge").value;
    let duration = document.getElementById("courseDuration").value;
    if (!name || !owner) {
        return alert("课程名称、主讲人必填！");
    }
    let arr = getStorage(DB_KEY.course);
    arr.push({
        id: Date.now(),
        line,
        name,
        owner,
        age,
        duration,
        check: false
    });
    setStorage(DB_KEY.course, arr);
    renderCourse();
    updateHomeStats();
}

function renderCourse(){
    let arr=getStorage(DB_KEY.course);
    let html="";
    arr.forEach(i=>{
        html+=`<tr>
        <td><input type="checkbox" ${i.check?'checked':''} onclick="checkCourse(${i.id})"></td>
        <td>${i.line}</td><td>${i.name}</td><td>${i.owner}</td>
        <td>${i.age||'无'}</td><td>${i.duration||'无'}</td><td>-</td>
        </tr>`;
    });
    let tbody = document.getElementById("courseTableBody");
    if (tbody) tbody.innerHTML=html;
}

function checkCourse(id){
    let arr=getStorage(DB_KEY.course);
    let o=arr.find(x=>x.id==id);
    if(o) o.check=!o.check;
    setStorage(DB_KEY.course,arr);
    renderCourse();
}

function deleteSelectedCourse(){
    let arr=getStorage(DB_KEY.course).filter(x=>!x.check);
    setStorage(DB_KEY.course,arr);
    renderCourse();
    updateHomeStats();
}

function batchDownloadCourse(){
    alert("批量下载模拟触发");
}

// ===================== 7. 文档模板库模块 =====================
function submitTemplate(){
    let name=document.getElementById("templateName").value.trim();
    let type=document.getElementById("templateType").value;
    if(!name) {
        return alert("模板名称必填！");
    }
    let arr=getStorage(DB_KEY.template);
    arr.push({
        id:Date.now(),
        name,
        type,
        user:nowUser.name,
        check:false
    });
    setStorage(DB_KEY.template,arr);
    renderTemplate();
}

function renderTemplate(){
    let arr=getStorage(DB_KEY.template);
    let html="";
    arr.forEach(i=>{
        html+=`<tr>
        <td><input type="checkbox" ${i.check?'checked':''} onclick="checkTemplate(${i.id})"></td>
        <td>${i.name}</td><td>${i.type}</td><td>${i.user}</td>
        <td><button onclick="deleteTemplate(${i.id})" class="btn-danger">删除</button></td>
        </tr>`;
    });
    let tbody = document.getElementById("templateTableBody");
    if (tbody) tbody.innerHTML=html;
}

function checkTemplate(id){
    let arr=getStorage(DB_KEY.template);
    let o=arr.find(x=>x.id==id);
    if(o) o.check=!o.check;
    setStorage(DB_KEY.template,arr);
    renderTemplate();
}

function deleteSelectedTemplate(){
    let arr=getStorage(DB_KEY.template).filter(x=>!x.check);
    setStorage(DB_KEY.template,arr);
    renderTemplate();
}

function deleteTemplate(id){
    let arr=getStorage(DB_KEY.template).filter(x=>x.id!==id);
    setStorage(DB_KEY.template,arr);
    renderTemplate();
}

function batchDownloadTemplate(){
    alert("模板批量下载模拟触发");
}

// ===================== 8. 辅助工具模块 =====================
function saveNewTool(){
    let name=document.getElementById("toolNameInput").value.trim();
    let url=document.getElementById("toolUrlInput").value.trim();
    if(!name||!url) {
        return alert("工具名称和链接不能为空！");
    }
    let arr=getStorage(DB_KEY.tool);
    arr.push({
        id:Date.now(),
        name,
        url,
        check:false
    });
    setStorage(DB_KEY.tool,arr);
    renderTool();
    document.getElementById("toolNameInput").value="";
    document.getElementById("toolUrlInput").value="";
}

function renderTool(){
    let arr=getStorage(DB_KEY.tool);
    let html="";
    arr.forEach(i=>{
        html+=`<div class="tool-item">
            <span>${i.name}</span>
            <a href="${i.url}" target="_blank">打开</a>
            <button onclick="delTool(${i.id})">删除</button>
        </div>`;
    });
    let container = document.getElementById("toolListContainer");
    if (container) container.innerHTML=html;
}

function delTool(id){
    let arr=getStorage(DB_KEY.tool).filter(x=>x.id!==id);
    setStorage(DB_KEY.tool,arr);
    renderTool();
}

// ===================== 9. 参考文献模块 =====================
function openRefUploadModal(){}
function openRefLinkModal(){}

function saveRefFile(){
    let name="默认文件";
    let cate="通用";
    let arr=getStorage(DB_KEY.ref);
    arr.push({
        id:Date.now(),
        name,
        cate,
        type:"文件",
        check:false
    });
    setStorage(DB_KEY.ref,arr);
    renderRef();
}

function saveRefLink(){
    let name="默认外链";
    let url="https://";
    let cate="通用";
    let arr=getStorage(DB_KEY.ref);
    arr.push({
        id:Date.now(),
        name,
        cate,
        url,
        type:"外链",
        check:false
    });
    setStorage(DB_KEY.ref,arr);
    renderRef();
}

function renderRef(){
    let arr=getStorage(DB_KEY.ref);
    let html="";
    arr.forEach(i=>{
        html+=`<tr>
        <td><input type="checkbox" ${i.check?'checked':''} onclick="checkRef(${i.id})"></td>
        <td>${i.name}</td><td>${i.cate}</td><td>${i.type}</td>
        <td>${i.type==="外链"?`<a href="${i.url}" target="_blank">访问</a>`:"-"}</td>
        </tr>`;
    });
    let tbody = document.getElementById("refTableBody");
    if (tbody) tbody.innerHTML=html;
}

function checkRef(id){
    let arr=getStorage(DB_KEY.ref);
    let o=arr.find(x=>x.id==id);
    if(o) o.check=!o.check;
    setStorage(DB_KEY.ref,arr);
    renderRef();
}

function batchDelRef(){
    let arr=getStorage(DB_KEY.ref).filter(x=>!x.check);
    setStorage(DB_KEY.ref,arr);
    renderRef();
}

// ===================== 10. 教学反思模块 =====================
function saveReflection(){
    let courseId=document.getElementById("refFilterCourse").value;
    let content=document.getElementById("refContent").value.trim();
    if(!content) {
        return alert("反思内容不能为空！");
    }
    let arr=getStorage(DB_KEY.reflection);
    arr.push({
        id:Date.now(),
        courseId:courseId,
        content:content,
        date:new Date().toLocaleDateString(),
        user:nowUser.name,
        check:false
    });
    setStorage(DB_KEY.reflection,arr);
    renderReflection();
    document.getElementById("refContent").value="";
}

function renderReflection(filter=null){
    let list=filter||getStorage(DB_KEY.reflection);
    let courseAll=getStorage(DB_KEY.course);
    let html="";
    list.forEach(i=>{
        let cName="全部课程";
        if(i.courseId!="all"){
            let c=courseAll.find(x=>x.id==i.courseId);
            if(c) cName=c.name;
        }
        html+=`<tr>
        <td><input type="checkbox" ${i.check?'checked':''} onclick="checkReflection(${i.id})"></td>
        <td>${cName}</td><td>${i.date}</td><td>${i.user}</td>
        <td><button>查看详情</button></td>
        </tr>`;
    });
    let tbody = document.getElementById("reflectionTableBody");
    if (tbody) tbody.innerHTML=html;
}

function checkReflection(id){
    let arr=getStorage(DB_KEY.reflection);
    let o=arr.find(x=>x.id==id);
    if(o) o.check=!o.check;
    setStorage(DB_KEY.reflection,arr);
    renderReflection();
}

function batchDelReflection(){
    let arr=getStorage(DB_KEY.reflection).filter(x=>!x.check);
    setStorage(DB_KEY.reflection,arr);
    renderReflection();
}

function filterReflection(){
    let cid=document.getElementById("refFilterCourse").value;
    let d=document.getElementById("refFilterDate").value;
    let all=getStorage(DB_KEY.reflection);
    let res=all.filter(x=>{
        let f1=(cid=="all"||x.courseId==cid);
        let f2=(!d||x.date==d);
        return f1&&f2;
    });
    renderReflection(res);
}

function resetRefFilter(){
    let courseSel = document.getElementById("refFilterCourse");
    let dateSel = document.getElementById("refFilterDate");
    if (courseSel) courseSel.value="all";
    if (dateSel) dateSel.value="";
    renderReflection();
}

function exportReflectionDoc(){
    let arr=getStorage(DB_KEY.reflection);
    let csv="关联课程,日期,撰写人,反思内容\n";
    arr.forEach(i=>{
        let cName="全部课程";
        if(i.courseId!="all"){
            let c=getStorage(DB_KEY.course).find(x=>x.id==i.courseId);
            if(c) cName=c.name;
        }
        csv+=`${cName},${i.date},${i.user},"${i.content}"\n`;
    });
    downloadFile(csv,"教学反思.csv");
}

// ===================== 11. AI课程研发模块 =====================
let aiResultCache = "";

function aiStartGenerate(){
    let prompt=document.getElementById("aiPrompt").value.trim();
    if(!prompt) {
        return alert("请输入课程需求！");
    }
    aiResultCache = `【AI生成课程方案】\n需求：${prompt}\n\n已模拟生成完整课程设计、流程、教案与拓展内容。`;
    let resDom = document.getElementById("aiResult");
    if (resDom) resDom.value = aiResultCache;
}

function saveAiToCourseRes(){
    if(!aiResultCache) {
        return alert("暂无生成内容！");
    }
    alert("已保存内容至课程库（模拟）");
}

function exportAllAiDoc(){
    if(!aiResultCache) {
        return alert("暂无内容可导出！");
    }
    downloadFile(aiResultCache,"AI课程方案.txt");
}

function clearAiEdit(){
    let promptDom = document.getElementById("aiPrompt");
    let resDom = document.getElementById("aiResult");
    if (promptDom) promptDom.value="";
    if (resDom) resDom.value="";
    aiResultCache="";
}

// ===================== 12. 课程物料清单 =====================
function addMaterial() {
    let course = document.getElementById("matCourseName").value.trim();
    let name = document.getElementById("matName").value.trim();
    let qty = document.getElementById("matQty").value;
    let spec = document.getElementById("matSpec").value.trim();
    if (!course || !name) {
        return alert("课程和物料名称不能为空！");
    }
    let arr = getStorage(DB_KEY.material);
    arr.push({
        id: Date.now(),
        course,
        name,
        qty,
        spec,
        createTime: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.material, arr);
    renderMaterial();
    document.getElementById("matCourseName").value = "";
    document.getElementById("matName").value = "";
    document.getElementById("matQty").value = "";
    document.getElementById("matSpec").value = "";
}

function renderMaterial() {
    let arr = getStorage(DB_KEY.material);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.course}</td>
            <td>${i.name}</td>
            <td>${i.qty}</td>
            <td>${i.spec}</td>
            <td>${i.createTime}</td>
            <td>
                <button onclick="alert('查看详情')">查看</button>
                <button onclick="delMaterial(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("materialTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delMaterial(id) {
    let arr = getStorage(DB_KEY.material).filter(x => x.id !== id);
    setStorage(DB_KEY.material, arr);
    renderMaterial();
}

// ===================== 13. 仓库出入库 =====================
function loadWarehouseLink() {
    let link = document.getElementById("warehouseLink").value.trim();
    if (!link) {
        return alert("请粘贴文档链接！");
    }
    alert("链接已保存，点击可跳转在线出入库表格");
}

// ===================== 14. 教室布置标准 =====================
function addClassroom() {
    let name = document.getElementById("roomName").value.trim();
    let course = document.getElementById("roomCourse").value.trim();
    if (!name || !course) {
        return alert("场地名称和适用课程不能为空！");
    }
    let arr = getStorage(DB_KEY.classroom);
    arr.push({
        id: Date.now(),
        name,
        course,
        createTime: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.classroom, arr);
    renderClassroom();
    document.getElementById("roomName").value = "";
    document.getElementById("roomCourse").value = "";
}

function renderClassroom() {
    let arr = getStorage(DB_KEY.classroom);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.name}</td>
            <td>${i.course}</td>
            <td>${i.createTime}</td>
            <td>
                <button onclick="alert('查看布置标准')">查看</button>
                <button onclick="delClassroom(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("classroomTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delClassroom(id) {
    let arr = getStorage(DB_KEY.classroom).filter(x => x.id !== id);
    setStorage(DB_KEY.classroom, arr);
    renderClassroom();
}

// ===================== 15. 人员/培训资料管理 =====================
function addPersonnelDoc() {
    let name = document.getElementById("personnelDocName").value.trim();
    let type = document.getElementById("personnelDocType").value;
    if (!name) {
        return alert("资料名称不能为空！");
    }
    let arr = getStorage(DB_KEY.personnel);
    arr.push({
        id: Date.now(),
        name,
        type,
        time: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.personnel, arr);
    renderPersonnel();
    document.getElementById("personnelDocName").value = "";
}

function renderPersonnel() {
    let arr = getStorage(DB_KEY.personnel);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.name}</td>
            <td>培训资料</td>
            <td>${i.type}</td>
            <td>${i.time}</td>
            <td>
                <button onclick="alert('下载资料')">下载</button>
                <button onclick="delPersonnel(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("personnelTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delPersonnel(id) {
    let arr = getStorage(DB_KEY.personnel).filter(x => x.id !== id);
    setStorage(DB_KEY.personnel, arr);
    renderPersonnel();
}

// ===================== 16. 学生综合表现评价 =====================
function addStudentEval() {
    let student = prompt("请输入学生姓名：");
    if (!student) return;
    let arr = getStorage(DB_KEY.studentEval);
    arr.push({
        id: Date.now(),
        student: student,
        course: "通用课程",
        discipline: "良好",
        handsOn: "良好",
        teamwork: "良好",
        knowledge: "良好",
        createTime: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.studentEval, arr);
    renderStudentEval();
}

function renderStudentEval() {
    let arr = getStorage(DB_KEY.studentEval);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.student}</td>
            <td>${i.course}</td>
            <td>${i.discipline}</td>
            <td>${i.handsOn}</td>
            <td>${i.teamwork}</td>
            <td>${i.knowledge}</td>
            <td>
                <button onclick="alert('查看评价详情')">查看</button>
                <button onclick="delStudentEval(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("studentEvalTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delStudentEval(id) {
    let arr = getStorage(DB_KEY.studentEval).filter(x => x.id !== id);
    setStorage(DB_KEY.studentEval, arr);
    renderStudentEval();
}

function exportStudentEval() {
    let arr = getStorage(DB_KEY.studentEval);
    let csv = "学生姓名,课程,纪律,动手能力,团队协作,知识吸收\n";
    arr.forEach(i => {
        csv += `${i.student},${i.course},${i.discipline},${i.handsOn},${i.teamwork},${i.knowledge}\n`;
    });
    downloadFile(csv, "学生综合评价.csv");
}

// ===================== 17. 满意度统计 =====================
function addSatisfaction() {
    let arr = getStorage(DB_KEY.satisfaction);
    arr.push({
        id: Date.now(),
        evaluator: "家长",
        course: "通用课程",
        level: "非常满意",
        content: "课程内容丰富，体验良好",
        time: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.satisfaction, arr);
    renderSatisfaction();
}

function renderSatisfaction() {
    let arr = getStorage(DB_KEY.satisfaction);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.evaluator}</td>
            <td>${i.course}</td>
            <td>${i.level}</td>
            <td>${i.content}</td>
            <td>
                <button onclick="alert('查看详情')">查看</button>
                <button onclick="delSatisfaction(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("satisfactionTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delSatisfaction(id) {
    let arr = getStorage(DB_KEY.satisfaction).filter(x => x.id !== id);
    setStorage(DB_KEY.satisfaction, arr);
    renderSatisfaction();
}

function exportSatisfaction() {
    let arr = getStorage(DB_KEY.satisfaction);
    let csv = "评价方,课程,满意度,评价内容,评价时间\n";
    arr.forEach(i => {
        csv += `${i.evaluator},${i.course},${i.level},"${i.content}",${i.time}\n`;
    });
    downloadFile(csv, "满意度统计表.csv");
}

// ===================== 18. 研学成果 =====================
function addAchievement() {
    let arr = getStorage(DB_KEY.achievement);
    arr.push({
        id: Date.now(),
        name: "学生实践作品",
        type: "手作作品",
        student: "学员",
        course: "研学课程",
        time: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.achievement, arr);
    renderAchievement();
}

function renderAchievement() {
    let arr = getStorage(DB_KEY.achievement);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.name}</td>
            <td>${i.type}</td>
            <td>${i.student}</td>
            <td>${i.course}</td>
            <td>${i.time}</td>
            <td>
                <button onclick="alert('查看成果')">查看</button>
                <button onclick="delAchievement(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("achievementTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delAchievement(id) {
    let arr = getStorage(DB_KEY.achievement).filter(x => x.id !== id);
    setStorage(DB_KEY.achievement, arr);
    renderAchievement();
}

function exportAchievement() {
    alert("研学成果打包导出（模拟）");
}

// ===================== 19. 学情数据分析 =====================
function addAnalysis() {
    let arr = getStorage(DB_KEY.analysis);
    arr.push({
        id: Date.now(),
        theme: "学段难度分析",
        grade: "小学中段",
        course: "综合研学课",
        conclusion: "难度适中，可优化互动环节",
        time: new Date().toLocaleDateString()
    });
    setStorage(DB_KEY.analysis, arr);
    renderAnalysis();
}

function renderAnalysis() {
    let arr = getStorage(DB_KEY.analysis);
    let html = "";
    arr.forEach(i => {
        html += `<tr>
            <td>${i.theme}</td>
            <td>${i.grade}</td>
            <td>${i.course}</td>
            <td>${i.conclusion}</td>
            <td>
                <button onclick="alert('查看分析报告')">查看</button>
                <button onclick="delAnalysis(${i.id})">删除</button>
            </td>
        </tr>`;
    });
    let tbody = document.getElementById("analysisTableBody");
    if (tbody) tbody.innerHTML = html;
}

function delAnalysis(id) {
    let arr = getStorage(DB_KEY.analysis).filter(x => x.id !== id);
    setStorage(DB_KEY.analysis, arr);
    renderAnalysis();
}

function exportAnalysis() {
    let arr = getStorage(DB_KEY.analysis);
    let csv = "分析主题,适用学段,对应课程,分析结论,分析时间\n";
    arr.forEach(i => {
        csv += `${i.theme},${i.grade},${i.course},"${i.conclusion}",${i.time}\n`;
    });
    downloadFile(csv, "学情数据分析报告.csv");
}

// ===================== 20. 个人教学档案 =====================
function renderProfile() {
    let teachingHtml = `<tr>
        <td>示例课程</td>
        <td>${new Date().toLocaleDateString()}</td>
        <td>小学</td>
        <td>4课时</td>
        <td>已完成</td>
    </tr>`;
    let teachBody = document.getElementById("teachingRecordBody");
    if (teachBody) teachBody.innerHTML = teachingHtml;

    let evalHtml = `<tr>
        <td>同事</td>
        <td>示例课程</td>
        <td>90分</td>
        <td>优秀</td>
        <td>${new Date().toLocaleDateString()}</td>
    </tr>`;
    let evalBody = document.getElementById("evaluationRecordBody");
    if (evalBody) evalBody.innerHTML = evalHtml;
}

// ===================== 21. 个人任务中心 =====================
function renderPersonalTask() {
    let arr = getStorage(DB_KEY.task);
    let html = "";
    arr.forEach(i => {
        let now = new Date();
        let dead = new Date(i.deadline);
        let statusTxt = "待办";
        if (dead < now) statusTxt = "已逾期";
        html += `<tr>
            <td>${i.content}</td>
            <td>${i.deadline}</td>
            <td>${statusTxt}</td>
            <td><button onclick="alert('处理任务')">操作</button></td>
        </tr>`;
    });
    let tbody = document.getElementById("personalTaskTableBody");
    if (tbody) tbody.innerHTML = html;
}

// ===================== 22. 用户管理模块 =====================
function renderUserTable() {
    let arr = getStorage(DB_KEY.user);
    let html = "";
    arr.forEach(item => {
        const disabled = (item.account === nowUser.account) ? "disabled" : "";
        html += `<tr>
            <td><input type="checkbox" ${disabled} data-id="${item.id}" onclick="checkUser(${item.id}, this)"></td>
            <td>${item.account}</td>
            <td>${item.name}</td>
            <td>${item.role === 'admin' ? '管理员' : '普通用户'}</td>
            <td><button onclick="deleteUser(${item.id})" ${disabled} class="btn-danger">删除</button></td>
        </tr>`;
    });
    let tbody = document.getElementById("userTableBody");
    if (tbody) tbody.innerHTML = html;
}

function checkUser(id, el) {}

function addUser() {
    let account = document.getElementById("newAccount").value.trim();
    let name = document.getElementById("newName").value.trim();
    let role = document.getElementById("newRole").value;
    if (!account || !name) {
        return alert("账号和姓名不能为空！");
    }
    let arr = getStorage(DB_KEY.user);
