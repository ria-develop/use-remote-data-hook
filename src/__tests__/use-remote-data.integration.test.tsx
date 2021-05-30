/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, unmountComponentAtNode} from 'react-dom';
import {FetchService} from '../use-remote-data';
import {TestRequestData, TestResponseData} from '../__mocks__/mock-interfaces';
import {TestComponent} from '../__mocks__/mock-implementation';

describe('Test with axios', () => {
  let service:
    | (FetchService<TestRequestData, TestResponseData> & {
        getResponse: (requestData: TestRequestData) => Promise<TestResponseData>;
      })
    | null;

  let container: HTMLDivElement | null = null;
  beforeEach(() => {
    service = {
      getResponse: (requestData: TestRequestData): Promise<TestResponseData> => {
        if (requestData.name === 'John') {
          return Promise.resolve([{name: 'John', details: 'Nothing'}]);
        } else {
          return Promise.reject(new Error('Error 404'));
        }
      },
      send(input: TestRequestData): Promise<TestResponseData> {
        return this.getResponse(input);
      }
    };
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container!);
    service = null;
    container!.remove();
    container = null;
  });
  it('should request nothing if no input provided', async () => {
    await act(async () => {
      render(<TestComponent service={service!} />, container);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="application"
        />
      </div>
    `);
  });
  it('should request details if name John provided', async () => {
    let resolveNow: (value: TestResponseData | PromiseLike<TestResponseData>) => void;
    service!.getResponse = () => {
      return new Promise((resolve) => {
        resolveNow = resolve;
      });
    };
    const JOHN = {name: 'John'};
    await act(async () => {
      render(<TestComponent inputData={JOHN} service={service!} />, container);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="application"
        >
          <div>
            loading...
          </div>
        </div>
      </div>
    `);
    resolveNow!([{name: 'John', details: 'Nothing'}]);
    await act(async () => {
      render(<TestComponent inputData={JOHN} service={service!} />, container);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="application"
        >
          <div>
            [{"name":"John","details":"Nothing"}]
          </div>
        </div>
      </div>
    `);
  });
  it('should render error 404 if name Kate provided', async () => {
    await act(async () => {
      render(<TestComponent inputData={{name: 'Kate'}} service={service!} />, container);
    });
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="application"
        >
          <div>
            Error 404
          </div>
        </div>
      </div>
    `);
  });
});
