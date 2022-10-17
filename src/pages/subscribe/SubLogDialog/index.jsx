import AppBar from "@mui/material/AppBar";
import {Dialog, IconButton, MenuItem, Select, Toolbar, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {useEffect, useState} from "react";
import {useGetSubLogs, useGetSubLogText} from "@/utils/subscribe";
import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {sublime} from '@uiw/codemirror-theme-sublime';
import {EditorView} from "@codemirror/view";


function toDate(text) {
    text = text.replace(/\-/g, "/");
    return new Date(text);
}

const SubLogDialog = ({open, handleClose, subId, title, selectTime = null, subType = 'Sub'}) => {
    const [logText, setLogText] = useState("选择一个运行事件后，可以加载本次处理过程的详细日志");
    const [timeOption, setTimeOption] = useState([]);
    const [selectLogId, setSelectLogId] = useState(null);
    const {mutate: getSubLogs} = useGetSubLogs()
    const {mutate: getSubLogText} = useGetSubLogText()
    useEffect(() => {
        if (!subId) {
            setSelectLogId(null);
            setLogText("选择一个运行事件后，可以加载本次处理过程的详细日志");
            return;
        }
        getSubLogs({
            sub_id: subId,
            sub_type: subType
        }, {
            onSuccess: res => {
                const {code, message: msg, data} = res;
                if (code === 0) {
                    setTimeOption(data);
                    if (data && data.length > 0) {
                        if (!selectTime) {
                            setSelectLogId(data[0].id);
                        } else {
                            const d1 = toDate(selectTime);
                            let min = null;
                            let logId = null;
                            for (let item of data) {
                                const d2 = toDate(item.time);
                                let dis = Math.abs(d1.getTime() - d2.getTime());
                                if (min === null || dis < min) {
                                    min = dis;
                                    logId = item.id;
                                }
                            }
                            setSelectLogId(logId);
                        }
                    } else {
                        setLogText("这条订阅没有运行记录，或者正在处理中，请稍后查看！")
                    }
                }
            }
        });
    }, [subId, selectTime])
    useEffect(() => {
        if (!selectLogId) {
            return;
        }
        getSubLogText({
            log_id: selectLogId
        }, {
            onSuccess: res => {
                const {code, message: msg, data} = res;
                if (code === 0) {
                    setLogText(data);
                }
            }
        })
    }, [selectLogId]);
    return (<Dialog
        fullScreen
        open={Boolean(open)}
        onClose={handleClose}
    >
        <AppBar sx={{position: 'relative'}}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                >
                    <CloseIcon/>
                </IconButton>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    {title}
                </Typography>
                <Select
                    size={"small"}
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    label="Age"
                    value={selectLogId}
                    onChange={(e) => setSelectLogId(e.target.value)}
                >
                    {timeOption && timeOption.length > 0 && timeOption.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.time}</MenuItem>
                    ))}
                </Select>
            </Toolbar>
        </AppBar>
        {/* <TextareaAutosize
            aria-label="运行时日志"
            value={logText}
            style={{
                width: "100%",
                height: "100%",
                fontFamily: "monospace",
                resize: 'vertical',
                overflow: 'auto',
                backgroundColor: "#1d1f21",
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#acbbc7",
                border: "solid 0px",
                outline: "none"
            }}
        /> */}
        <CodeMirror
            value={logText}
            height="100%"
            width="100%"
            theme={sublime}
            readOnly={true}
            extensions={[javascript({jsx: true}), EditorView.lineWrapping]}
        />
    </Dialog>)
}

export default SubLogDialog;
