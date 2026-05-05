  let courses = [];
    let edges = [];

    function addCourse() {
        const nameInput = document.getElementById('courseName');
        const name = nameInput.value.trim().toUpperCase();
        const prereq = document.getElementById('prereqSelect').value;

        if (name && !courses.includes(name)) {
            courses.push(name);
            if (prereq) edges.push([prereq, name]);
            
            updateUI();
            nameInput.value = '';
        } else if (courses.includes(name)) {
            alert("Course already exists!");
        }
    }

    // NEW: Delete Function
    function deleteCourse(courseName) {
        // 1. Remove from the courses list
        courses = courses.filter(c => c !== courseName);

        // 2. Remove any edges (prerequisites) involving this course
        // This removes it as both a prerequisite and as a dependent
        edges = edges.filter(edge => edge[0] !== courseName && edge[1] !== courseName);

        // 3. Refresh UI and re-calculate the schedule automatically
        updateUI();
        calculateSchedule(); 
    }

    function updateUI() {
        const select = document.getElementById('prereqSelect');
        select.innerHTML = '<option value="">(None)</option>';
        courses.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);

        const list = document.getElementById('courseList');
        list.innerHTML = '<label>Current Courses:</label>';
        
        courses.forEach(c => {
            // Added a Delete Button (×) with styling
            list.innerHTML += `
                <div class="course-list-item">
                    <span>${c}</span>
                    <span onclick="deleteCourse('${c}')" style="color: #ef4444; cursor: pointer; font-weight: bold; padding: 0 5px;">×</span>
                </div>`;
        });
    }

    function clearAll() {
        courses = [];
        edges = [];
        updateUI();
        document.getElementById('output').innerHTML = '';
        document.getElementById('errorBox').style.display = 'none';
    }

    function calculateSchedule() {
        if (courses.length === 0) {
            document.getElementById('output').innerHTML = '';
            return;
        }

        const adj = {};
        const inDegree = {};
        const errorBox = document.getElementById('errorBox');
        errorBox.style.display = 'none';

        courses.forEach(c => { adj[c] = []; inDegree[c] = 0; });
        edges.forEach(([u, v]) => {
            adj[u].push(v);
            inDegree[v]++;
        });

        let queue = courses.filter(c => inDegree[c] === 0);
        let semesters = [];
        let processedCount = 0;

        while (queue.length > 0) {
            let currentSemester = [...queue];
            semesters.push(currentSemester);
            let nextQueue = [];

            currentSemester.forEach(u => {
                processedCount++;
                adj[u].forEach(v => {
                    inDegree[v]--;
                    if (inDegree[v] === 0) nextQueue.push(v);
                });
            });
            queue = nextQueue;
        }

        if (processedCount !== courses.length) {
            errorBox.style.display = 'block';
            document.getElementById('output').innerHTML = '';
            return;
        }

        renderSchedule(semesters);
    }

    function renderSchedule(semesters) {
        const output = document.getElementById('output');
        output.innerHTML = '';
        
        semesters.forEach((sem, index) => {
            const box = document.createElement('div');
            box.className = 'semester-box';
            box.style.animationDelay = `${index * 0.1}s`;
            box.innerHTML = `<h3>Semester ${index + 1}</h3>`;
            sem.forEach(course => {
                box.innerHTML += `<span class="course-tag">${course}</span>`;
            });
            output.appendChild(box);
        });
    }