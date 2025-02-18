import React, {useEffect, useState} from 'react';
import {
    Avatar as MuiAvatar,
    Box,
    Button,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListSubheader,
    SvgIcon
} from "@mui/material";
import {clearSysNotify, getAllSysNotify} from "@/api/UserApi";
import * as m_icon from "@mui/icons-material";
import * as f_icon from "react-feather";
import {get as _get} from "lodash-es";
import styled from "styled-components";
import {useInterval} from "@/utils/hooks";
import MessageAction from "@/pages/notify/actions";

const Avatar = styled(MuiAvatar)`
  background: ${(props) => props.theme.palette.primary.main};
`;

function MessageItem({item, onRefresh = null}) {
    const Icon = _get({
        ...m_icon,
        ...f_icon
    }, item.icon, null)
    return (
        <>
            <ListItem key={item.id} alignItems="flex-start" divider>
                <ListItemAvatar>
                    <Avatar>
                        <SvgIcon fontSize="small">
                            <Icon/>
                        </SvgIcon>
                    </Avatar>
                </ListItemAvatar>
                <Grid container spacing={2} sx={{alignItems: 'center'}}>
                    <Grid item xs={12} md={10}>
                        <ListItemText
                            primary={item.title}
                            secondary={item.message}
                        />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{textAlign: 'right'}}>
                        <ListItemText secondary={item.gmt_create}/>
                    </Grid>
                    <Grid xs={12} justifyContent={"flex-end"} item>
                        <MessageAction type={item.type} args={item.args ? JSON.parse(item.args) : null}
                                       has_action={item.has_action} action_log={item.action_log}
                                       description={null} onSuccess={onRefresh}/>
                    </Grid>
                </Grid>
            </ListItem>
        </>
    )
}

export default function Notify() {
    const [messageList, setMessageList] = useState([])
    const getMessageList = () => {
        getAllSysNotify().then((res) => {
            if (res) {
                setMessageList(res)
            }
        })
    }
    const clearMessage = async (e) => {
        const res = await clearSysNotify()
        if (res.code === 0) {
            setMessageList([])
        }
    }
    useEffect(() => {
        getMessageList()
    }, [])
    useInterval(getMessageList, 5000)
    return (
        <>
            <List sx={{width: '100%', bgcolor: 'background.paper'}} subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    所有消息
                </ListSubheader>
            }>
                {messageList.length > 0 ? messageList.map((item, index) => (
                    <MessageItem key={item.id} item={item} onRefresh={getMessageList}/>
                )) : (<ListItem>没有任何消息</ListItem>)}
            </List>
            <Box p={1} display="flex" justifyContent="center">
                <Button onClick={clearMessage}>
                    清空所有消息
                </Button>
            </Box>
        </>
    );
}