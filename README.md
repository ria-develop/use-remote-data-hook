# use-remote-data react hook

## What is it?

This is a basic implementation of remote data pm using dependency injection for service implementation

### Installation

```bash
npm i @ria-develop/use-remote-data
```

or

```bash
yarn add @ria-develop/use-remote-data
``` 

## basic usage

### **`MyDataViewComponent.tsx`**

```typescript jsx
import useRemoteData, {FetchService} from '@ria-develop/use-remote-data';
import React, {useCallback, useEffect} from 'react';

export function MyDataViewComponent<T, P>({
                                            inputData,
                                            service,
                                            dataDoView
                                          }: {
  inputData?: T;
  service: FetchService<T, P>;
  dataDoView: (data?: P) => JSX.Element | null;
}): JSX.Element {
  const {loading, error, data, send} = useRemoteData<T, P>(service);

  useEffect(() => {
    if (inputData) {
      send(inputData);
    }
  }, [send, inputData]);

  const viewData = useCallback(() => dataDoView(data), [data]);

  return (
    <div className="application"
      style={{display: 'flex', flexFlow: 'column'}}>
      {loading && <div>loading...</div>}
      {error && <div>{error.message}</div>}
      {data && viewData()}
    </div>
  );
}
```

### **`index.tsx`**
```typescript jsx
import {render} from 'react-dom';
import React from 'react';
import {MyDataViewComponent} from './MyDataViewComponent';
import {MyService} from './MyService';
import {DataRenderer} from './DataRenderer';

render(
  <MyDataViewComponent inputData={{page: 1, q: 'Clean Code'}}
    service={MyService}
    dataDoView={DataRenderer}/>,
  document.getElementById('root')
);
```

### **`MyService.ts`**

```typescript jsx
import {FetchService} from '@ria-develop/use-remote-data';
import {ExampleRequestData, ExampleResponseData} from './types';
import axios from 'axios';

const data: [] = [];

export const MyService: FetchService<ExampleRequestData, ExampleResponseData> = {
  cancel: () => ({}),
  send({q, page}: ExampleRequestData): Promise<ExampleResponseData> {
    return axios({
      method: 'GET',
      url: 'https://openlibrary.org/search.json',
      params: {q, page, limit: 10},
      cancelToken: new axios.CancelToken((c) => (this.cancel = c))
    }).then((res) => [...data, ...res.data.docs.map((book: { title: string }) => ({title: book.title}))]);
  }
};
```
### **`types.ts`**
```typescript jsx
export type ExampleRequestData = {
  q: string;
  page: number;
};
export type ExampleDataEntry = {
  title: string;
};

export type ExampleResponseData = ExampleDataEntry[];

```
### **`DataRenderer.ts`**
```typescript jsx
import {ExampleResponseData} from './types';
import React from 'react';

export const DataRenderer = (data?: ExampleResponseData): JSX.Element => (
  <>
    {(data &&
      data.map(({title}, index) => {
        return (
          <span key={index} style={{border: '1px solid lightblue', padding: '10px', margin: '5px'}}>
            {title}
          </span>
        );
      })) ||
      null}
  </>
);

```
