
export let home_page = `<h1>Welcome to Sound Mapping Application</h1>
<button>Create New Project</button>
<button>Open existing project DB.</button>`

export let import_page = "";

export function log(message){
    let area =$("#logging_textarea");
    message = message + "\n";
    area[0].innerHTML += message;
    return;
}

$(document).ready ( function(){
    log("Logging is ready!");
 });