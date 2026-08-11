/* =========================================================
   ADMIN CHART
========================================================= */

function renderAdminChart(){

    const chart =
        document.getElementById("adminChart");

    if(!chart) return;

    chart.innerHTML = "";

    const countsCM = countVotes("CM");
    const countsMLA = countVotes("MLA");

    const combined = [];

    candidates.forEach(c => {

        const count =
            c.position === "CM"
            ? countsCM[c.id] || 0
            : countsMLA[c.id] || 0;

        combined.push({
            candidate: c,
            votes: count
        });

    });

    const maxVotes =
        Math.max(
            1,
            ...combined.map(item => item.votes)
        );

    combined.forEach(item => {

        const barItem =
            document.createElement("div");

        barItem.className = "bar-item";

        const height =
            Math.max(
                3,
                (item.votes / maxVotes) * 170
            );

        barItem.innerHTML = `

            <strong>
                ${item.votes}
            </strong>

            <div
                class="bar"
                style="height:${height}px"
                title="${item.candidate.name}: ${item.votes} vote(s)">
            </div>

            <span>
                ${item.candidate.symbol}
                <br>
                ${item.candidate.name}
            </span>

        `;

        chart.appendChild(barItem);

    });

}


/* =========================================================
   VOTER MANAGEMENT
========================================================= */

function renderVoterManagement(){

    const container =
        document.getElementById(
            "voterManagement"
        );

    if(!container) return;

    container.innerHTML = "";

    voters.forEach(voter => {

        const item =
            document.createElement("div");

        item.className =
            "management-item";

        item.innerHTML = `

            <div>

                <strong>
                    ${voter.voterId}
                </strong>

                <small>
                    ${voter.name}
                    • ${voter.district}
                </small>

            </div>

            <div class="management-actions">

                <button
                    class="btn btn-small btn-danger"
                    onclick="deleteVoter('${voter.voterId}')">

                    🗑️ Delete

                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


/* =========================================================
   DELETE VOTER
========================================================= */

function deleteVoter(voterId){

    const voter =
        voters.find(
            v => v.voterId === voterId
        );

    if(!voter) return;

    const confirmed =
        confirm(
            `Delete voter ${voterId} - ${voter.name}?`
        );

    if(!confirmed) return;


    /* Remove voter */

    voters =
        voters.filter(
            v => v.voterId !== voterId
        );


    /* Remove related ballot */

    ballots =
        ballots.filter(
            b => b.voterId !== voterId
        );


    if(currentVoterId === voterId){

        currentVoterId = null;

        pendingCM = null;

        pendingMLA = null;

    }


    saveState();

    populateVoterSelector();

    updateAll();


    showToast(
        "Voter deleted successfully.",
        "success"
    );

}


/* =========================================================
   CANDIDATE MANAGEMENT
========================================================= */

function renderCandidateManagement(){

    const container =
        document.getElementById(
            "candidateManagement"
        );

    if(!container) return;

    container.innerHTML = "";


    candidates.forEach(candidate => {

        const item =
            document.createElement("div");

        item.className =
            "management-item";

        item.innerHTML = `

            <div>

                <strong>
                    ${candidate.symbol}
                    ${candidate.name}
                </strong>

                <small>
                    ${candidate.party}
                    •
                    ${candidate.position === "CM"
                        ? "Chief Minister"
                        : "MLA"}
                </small>

            </div>

            <div class="management-actions">

                <button
                    class="btn btn-small btn-danger"
                    onclick="deleteCandidate('${candidate.id}')">

                    🗑️ Delete

                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


/* =========================================================
   DELETE CANDIDATE
========================================================= */

function deleteCandidate(candidateId){

    const candidate =
        candidates.find(
            c => c.id === candidateId
        );

    if(!candidate) return;


    const confirmed =
        confirm(
            `Delete ${candidate.name}?\n\n` +
            `Position: ${candidate.position}`
        );

    if(!confirmed) return;


    /*
       Remove candidate
    */

    candidates =
        candidates.filter(
            c => c.id !== candidateId
        );


    /*
       Remove this candidate's
       selections from voters
    */

    voters.forEach(voter => {

        if(voter.cmCandidate === candidateId){

            voter.cmCandidate = null;

            voter.hasVoted = false;

            voter.receipt = null;

        }


        if(voter.mlaCandidate === candidateId){

            voter.mlaCandidate = null;

            voter.hasVoted = false;

            voter.receipt = null;

        }

    });


    /*
       Remove affected ballots
    */

    ballots =
        ballots.filter(
            ballot =>
                ballot.cmCandidate !== candidateId &&
                ballot.mlaCandidate !== candidateId
        );


    saveState();

    updateAll();


    showToast(
        "Candidate deleted successfully.",
        "success"
    );

}


/* =========================================================
   ADD CANDIDATE
========================================================= */

function addCandidate(event){

    event.preventDefault();


    const name =
        document.getElementById(
            "candidateName"
        ).value.trim();


    const party =
        document.getElementById(
            "candidateParty"
        ).value.trim();


    const position =
        document.getElementById(
            "candidatePosition"
        ).value;


    const symbol =
        document.getElementById(
            "candidateSymbol"
        ).value.trim();


    if(!name || !party || !symbol){

        showToast(
            "Please fill all candidate details.",
            "error"
        );

        return;

    }


    const prefix =
        position === "CM"
        ? "CM"
        : "MLA";


    const candidateNumber =
        candidates.filter(
            c => c.position === position
        ).length + 1;


    const candidate = {

        id:
            prefix +
            String(candidateNumber).padStart(3,"0") +
            Date.now(),

        name:name,

        party:party,

        partyId:"CUSTOM",

        position:position,

        symbol:symbol

    };


    candidates.push(candidate);

    saveState();


    document
        .getElementById("candidateForm")
        .reset();


    updateAll();


    showToast(
        "Candidate added successfully.",
        "success"
    );

}


/* =========================================================
   VOTER TABLE
========================================================= */

function renderVoterTable(){

    const tbody =
        document.getElementById(
            "voterTableBody"
        );

    if(!tbody) return;

    tbody.innerHTML = "";


    voters.forEach(voter => {

        const cmCandidate =
            voter.cmCandidate
            ? candidates.find(
                c => c.id === voter.cmCandidate
              )
            : null;


        const mlaCandidate =
            voter.mlaCandidate
            ? candidates.find(
                c => c.id === voter.mlaCandidate
              )
            : null;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${voter.voterId}
                </strong>
            </td>

            <td>
                ${voter.name}
            </td>

            <td>
                ${voter.district}
            </td>

            <td>
                ${voter.constituency}
            </td>

            <td>
                ${
                    cmCandidate
                    ? cmCandidate.symbol +
                      " " +
                      cmCandidate.name
                    : "—"
                }
            </td>

            <td>
                ${
                    mlaCandidate
                    ? mlaCandidate.symbol +
                      " " +
                      mlaCandidate.name
                    : "—"
                }
            </td>

            <td>

                ${
                    voter.hasVoted

                    ? `<span class="badge">
                         ✓ Voted
                       </span>`

                    : `<span
                         style="
                         color:var(--muted);
                         font-weight:700;">
                         Not Voted
                       </span>`
                }

            </td>

        `;


        tbody.appendChild(row);

    });

}


/* =========================================================
   UPDATE ALL
========================================================= */

function updateAll(){

    populateVoterSelector();

    updateHeroStats();

    renderResults();

    renderAdmin();


    /*
       Update current voting page
    */

    if(currentVoterId){

        renderVotingPage();

    }

}


/* =========================================================
   HERO STATISTICS
========================================================= */

function updateHeroStats(){

    const voterCount =
        document.getElementById(
            "heroVoterCount"
        );

    const candidateCount =
        document.getElementById(
            "heroCandidateCount"
        );


    if(voterCount){

        voterCount.textContent =
            voters.length;

    }


    if(candidateCount){

        candidateCount.textContent =
            candidates.length;

    }

}


/* =========================================================
   EXPORT JSON
========================================================= */

function exportJSON(){

    const data = {

        voters:voters,

        ballots:ballots,

        candidates:candidates,

        electionOpen:electionOpen,

        exportedAt:
            new Date().toISOString()

    };


    const json =
        JSON.stringify(
            data,
            null,
            4
        );


    downloadFile(
        json,
        "ap-votesecure-backup.json",
        "application/json"
    );


    showToast(
        "JSON backup exported.",
        "success"
    );

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV(){

    const headers = [

        "Voter ID",
        "Name",
        "District",
        "Constituency",
        "CM Candidate",
        "MLA Candidate",
        "Status",
        "Receipt"

    ];


    const rows =
        voters.map(voter => {

            const cm =
                candidates.find(
                    c => c.id === voter.cmCandidate
                );


            const mla =
                candidates.find(
                    c => c.id === voter.mlaCandidate
                );


            return [

                voter.voterId,

                voter.name,

                voter.district,

                voter.constituency,

                cm
                    ? cm.name
                    : "",

                mla
                    ? mla.name
                    : "",

                voter.hasVoted
                    ? "Voted"
                    : "Not Voted",

                voter.receipt || ""

            ];

        });


    const csvRows = [

        headers,

        ...rows

    ];


    const csv =
        csvRows
        .map(row =>
            row.map(value =>
                `"${String(value)
                    .replace(/"/g,'""')}"`
            ).join(",")
        )
        .join("\n");


    downloadFile(
        csv,
        "ap-votesecure-voters.csv",
        "text/csv"
    );


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


/* =========================================================
   DOWNLOAD FILE
========================================================= */

function downloadFile(
    content,
    fileName,
    type
){

    const blob =
        new Blob(
            [content],
            {type:type}
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);

}


/* =========================================================
   IMPORT JSON
========================================================= */

function importJSON(event){

    const file =
        event.target.files[0];


    if(!file){

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function(e){

        try{

            const data =
                JSON.parse(
                    e.target.result
                );


            if(
                !data.voters ||
                !data.ballots ||
                !data.candidates
            ){

                throw new Error(
                    "Invalid backup format."
                );

            }


            const confirmed =
                confirm(
                    "Import this backup?\n\n" +
                    "Current browser data will be replaced."
                );


            if(!confirmed){

                event.target.value = "";

                return;

            }


            voters =
                data.voters;


            ballots =
                data.ballots;


            candidates =
                data.candidates;


            electionOpen =
                data.electionOpen !== false;


            currentVoterId = null;

            pendingCM = null;

            pendingMLA = null;


            saveState();

            updateAll();


            showToast(
                "Backup imported successfully.",
                "success"
            );


        }catch(error){

            console.error(error);


            showToast(
                "Invalid JSON backup file.",
                "error"
            );

        }


        event.target.value = "";

    };


    reader.readAsText(file);

}


/* =========================================================
   MODAL FUNCTIONS
========================================================= */

function closeModal(id){

    const modal =
        document.getElementById(id);


    if(modal){

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = ""
){

    const toast =
        document.getElementById(
            "toast"
        );


    if(!toast) return;


    toast.textContent =
        message;


    toast.className = "";


    toast.id = "toast";


    toast.classList.add("show");


    if(type){

        toast.classList.add(type);

    }


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        },3000);

}


/* =========================================================
   KEYBOARD / MODAL CONTROL
========================================================= */

document.addEventListener(
    "keydown",
    function(event){

        if(event.key === "Escape"){

            closeModal(
                "confirmModal"
            );

            closeModal(
                "receiptModal"
            );

        }

    }
);


/* =========================================================
   CLICK OUTSIDE MODAL
========================================================= */

document.addEventListener(
    "click",
    function(event){

        if(
            event.target.classList.contains(
                "modal"
            )
        ){

            event.target.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   LOGOUT HELPER
========================================================= */

function logoutVoter(){

    currentVoterId = null;

    pendingCM = null;

    pendingMLA = null;


    document.getElementById(
        "loginVoterId"
    ).value = "";


    document.getElementById(
        "loginPassword"
    ).value = "";


    showToast(
        "Logged out successfully.",
        "success"
    );


    showPage("home");

}


/* =========================================================
   INITIAL DATA SAFETY CHECK
========================================================= */

function ensureDataIntegrity(){

    if(!Array.isArray(voters)){

        voters = [];

    }


    if(!Array.isArray(ballots)){

        ballots = [];

    }


    if(!Array.isArray(candidates)){

        candidates = [];

    }


    if(typeof electionOpen !== "boolean"){

        electionOpen = true;

    }

}


/* =========================================================
   RUN DATA CHECK
========================================================= */

ensureDataIntegrity();
