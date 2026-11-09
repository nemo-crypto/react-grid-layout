import React from "react";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import WidthProvider from "../../lib/components/WidthProvider";

jest.mock("resize-observer-polyfill", () =>
  jest.fn().mockImplementation(callback => ({
    callback,
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }))
);

describe("WidthProvider observed node lifecycle", () => {
  it("observes the mounted grid instead of its removed placeholder", () => {
    const Grid = ({ innerRef, width }) => (
      <div ref={innerRef} data-width={width} />
    );
    const Wrapped = WidthProvider(Grid);
    const wrapper = mount(<Wrapped measureBeforeMount />);
    const instance = wrapper.instance();
    const observer = instance.resizeObserver;
    const placeholder = instance.elementRef.current;
    expect(observer.observe).toHaveBeenCalledWith(placeholder);

    act(() => observer.callback([
      { target: placeholder, contentRect: { width: 900 } }
    ]));
    wrapper.update();
    const grid = instance.elementRef.current;
    expect(grid).not.toBe(placeholder);
    expect(observer.unobserve).toHaveBeenCalledWith(placeholder);
    expect(observer.observe).toHaveBeenCalledWith(grid);
    expect(wrapper.find("[data-width]").prop("data-width")).toBe(900);

    act(() => observer.callback([
      { target: placeholder, contentRect: { width: 0 } },
      { target: grid, contentRect: { width: 0 } }
    ]));
    expect(instance.state.width).toBe(900);
    act(() => observer.callback([
      { target: grid, contentRect: { width: 640 } }
    ]));
    expect(instance.state.width).toBe(640);
    wrapper.unmount();
    expect(observer.unobserve).toHaveBeenCalledWith(grid);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
