export function log(message){
    let area =$("#logging_textarea");
    message = message + "\n";
    area[0].innerHTML += message;
    return;
}

$(function(){
    log("Logging is ready!");
 });