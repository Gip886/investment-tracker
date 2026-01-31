import React from 'react';
import { Dialog, Input } from 'antd-mobile';

export const prompt = (props: { title?: string; content?: string; placeholder?: string; defaultValue?: string }) => {
  return new Promise<string | null>((resolve) => {
    let value = props.defaultValue || '';
    Dialog.show({
      title: props.title,
      content: (
        <div>
          {props.content && <div style={{ marginBottom: 12 }}>{props.content}</div>}
          <Input
            placeholder={props.placeholder}
            defaultValue={value}
            onChange={v => { value = v }}
            style={{ border: '1px solid #eee', padding: '4px 8px', borderRadius: 4 }}
          />
        </div>
      ),
      closeOnAction: true,
      actions: [
        {
          key: 'cancel',
          text: '取消',
          onClick: () => resolve(null),
        },
        {
          key: 'confirm',
          text: '确定',
          onClick: () => resolve(value),
        },
      ],
    });
  });
};
