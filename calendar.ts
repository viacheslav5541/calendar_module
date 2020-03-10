import moment from 'moment'
import 'moment/locale/ru'

export default class Calendar{
    //переменные всех полей календаря
    protected calendar_body:  HTMLDivElement;
    private header: HTMLDivElement;
    protected days_field: HTMLDivElement;
    protected previous_month_button:    HTMLDivElement;
    protected next_month_button:    HTMLDivElement;
    protected month_text: HTMLElement;
    private is_show:boolean = false;
    //переменные дат
    protected cursor_date: string  ; //курсор , меняется в зависимости на каком месяце мы находимся, по умолчанию в конструкторе равен текущей дате

    //массивы
    protected days_name: string[];
    protected holydays:[];
    protected weeks_display: boolean = true;


    constructor(){
        this.calendar_body = document.createElement('div');
        document.body.append(this.calendar_body);
        this.header = document.createElement('div');
        this.days_field = document.createElement('table');
        this.previous_month_button = document.createElement('div');
        this.next_month_button = document.createElement('div');
        this.month_text = document.createElement('text');
        this.days_name = ['Пн','Вт',"Ср","Чт","Пт","Сб","Вс"];
        this.holydays = [];
        this.cursor_date = moment().format('MM.DD.YYYY');
        this.calendar_body.className = 'calendar';
        this.header.className = 'calendar_header';
        this.days_field.className = 'days_table';
        this.next_month_button.className = 'next_month_button';
        this.previous_month_button.className = 'prev_month_button';
        this.next_month_button.innerText = '>';
        this.previous_month_button.innerText = '<';
        this.month_text.className = 'month_text';
        // @ts-ignore
        this.next_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).add(1,'month'));
        // @ts-ignore
        this.previous_month_button.onclick = () => this.change_cursor_date(moment(this.cursor_date).subtract(1,'month'));
        this.header.style.cssText = 'display:flex'
        this.month_text.style.cssText = "flex-basis:10%;text-align:center"
    }

    protected get_days(month:string){
        const days = []
        const dateStart = moment(month).startOf('month').startOf('week')
        const dateEnd = moment(month).endOf('month').endOf('week').subtract(1,'days')
        while (dateEnd.diff(dateStart, 'days') >= 0) {
            days.push(dateStart.format('MM.DD.YYYY'))
            dateStart.add(1, 'days')
        }
        var subarray = []
        for (let i = 0; i <Math.ceil(days.length/7); i++){
            subarray[i] = days.slice((i*7), (i*7) + 7);
        }
        return subarray
    }

    protected update_date(date:string){
        this.days_field.innerHTML = '';
        var tr = document.createElement('tr'),
            th:any,
            days = this.get_days(date);
        this.days_field.append(tr);
        if (this.weeks_display) {
            th = document.createElement('th');
            th.className = 'week_number';
            th.innerText = "№";
            tr.append(th)
        }
        this.days_name.map((item)=>{
            th = document.createElement('th');
            th.className = 'week_days_name'
            th.innerText = item;
            tr.append(th);
        })
        this.month_text.innerText = `${moment(date).locale('ru').format("MMMM YYYY")}`;

        var cur_mon = moment(days[2][2]).format('MM');
        days.map((week)=>{
            tr = document.createElement('tr');
            this.days_field.append(tr)
            if (this.weeks_display) {
                th = document.createElement('th');
                th.innerText = `${moment(week[0]).isoWeek()}`;
                tr.append(th)
            }
            week.map((day_date)=>{
                th = document.createElement('td');
                moment(this.cursor_date).format("MM.DD.YYYY") === day_date? th.className += "target ":void(0);
                this.holydays.map((holiday_date)=>{
                    moment(holiday_date).format("MM.DD.YYYY") === day_date? th.className += 'holiday ':void(0);
                });
                // @ts-ignore
                day_date = day_date.split('.');
                day_date[0]===cur_mon?th.className += 'cur_month':th.className += 'last_month';
                th.innerText = day_date[1];
                th.onclick = () =>{
                    // @ts-ignore
                    this.cursor_date = moment(day_date.join(" ")).format('MM.DD.YYYY');
                    this.update_date(this.cursor_date);
                };
                tr.append(th)
            })
        })

    }
    //возвращает дату в отформатированном под русский формат виде
    public get_formated_date(){
        return (this.date_to_en_format(moment(this.cursor_date).format('MM.DD.YYYY')));
    }

    protected change_cursor_date(date:string){
        this.cursor_date = date;
        this.update_date(date);
    }

    public get_calendar_body(){
        return this.calendar_body;
    }

    public hide_calendar(){
        if(this.is_show){
        this.calendar_body.removeChild(this.header);
        this.calendar_body.removeChild(this.days_field);
        this.is_show = false;
        }
    }

    public draw_calendar(date:string = this.cursor_date){
        if(!this.is_show) {
        this.header.append(this.previous_month_button,this.month_text,this.next_month_button);
        this.calendar_body.append(this.header);
        this.calendar_body.append(this.days_field);
        this.update_date(this.cursor_date);
        this.is_show = true;
        }

        moment(this.date_to_en_format(date)).format() !== 'Invalid date'?this.change_cursor_date(this.date_to_en_format(date)):void(0);
    }

    public upload_holidays(arr:string[]){
        arr.map((item)=>{
            // @ts-ignore
            this.holydays.push(this.date_to_en_format(item))
        });
    }


    protected date_to_en_format(date:string){
        var cur_month = moment().format('MM');
        var cur_year = moment().format('YYYY');
        // @ts-ignore
        date = date.split('.');
        console.log(date)
        if(date.length == 1) {
            // @ts-ignore
            date[1] = cur_month;
            // @ts-ignore
            date[2] = cur_year;
        }
        if(date.length == 2) {
            if(date[1]=='')
                {
                    // @ts-ignore
                    date[1] = cur_month
                }
            // @ts-ignore

            date[2] = cur_year;
        }
        if(date.length == 3){
            if(date[2] == ''){
                // @ts-ignore
                date[2] = cur_year
            }
        }

        return [date[1],date[0],date[2]].join('.');
    }

    protected set_weeks_dispaly(tf:boolean){
        this.weeks_display = tf;
    }
}



