export class NotificationManager {

    public static showNotification(msg: string, isError: boolean = false, timeout: number = 3000) {
        let notification = $(`<div class='notification ${isError ? "error" : "info"}'>${msg}</div>`);
        $(".notifications").append(notification);

        let hideFunc = () => {
            notification.detach();
            /*notification.fadeTo(500, 0, () => {
                
            });*/
        }
        $(notification).click(function () {
            hideFunc();
        })
        window.setTimeout(() => {
            hideFunc();
        }, timeout);
    }
}
