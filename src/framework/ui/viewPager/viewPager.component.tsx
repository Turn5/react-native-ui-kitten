/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  PanResponderCallbacks,
  PanResponderGestureState,
  PanResponderInstance,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

type ChildElement = React.ReactElement<any>;
type ChildrenProp = ChildElement | ChildElement[];

interface ComponentProps {
  children: ChildrenProp;
  selectedIndex?: number;
  shouldLoadComponent?: (index: number) => boolean;
  onOffsetChange?: (offset: number) => void;
  onSelect?: (index: number) => void;
}

export type ViewPagerProps = ViewProps & ComponentProps;

/**
 * Allows flipping through the "pages".
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<any> | React.ReactElement<any>[]} children - Determines children of the component.
 *
 * @property {number} selectedIndex - Determines the index of selected "page".
 *
 * @property {(index: number) => boolean} shouldLoadComponent - Determines loading behavior particular page and can be
 * used for lazy loading.
 *
 * @property {(offset: number) => void} onOffsetChange - Fires on scroll event with current scroll offset.
 *
 * @property {(index: number) => void} onSelect - Fires on "page" select with corresponding index.
 *
 * @property ScrollViewProps
 *
 * @example Simple usage example
 *
 * ```
 * import React from 'react';
 * import { ViewPager } from 'react-native-ui-kitten';
 *
 * export class ViewPagerShowcase extends React.Component {
 *   public state: State = {
 *      selectedIndex: 0,
 *    };
 *
 *   private onIndexChange = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <ViewPager
 *         selectedIndex={this.state.selectedIndex}
 *         onSelect={this.onIndexChange}>
 *         <View>
 *           <Text>Tab 1</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 2</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 3</Text>
 *         </View>
 *       </ViewPager>
 *     );
 *   }
 * }
 * ```
 *
 * @example Lazy loading usage example
 *
 * ```
 * import React from 'react';
 * import { ViewPager } from 'react-native-ui-kitten';
 *
 * export class ViewPagerShowcase extends React.Component {
 *   public state: State = {
 *      selectedIndex: 0,
 *    };
 *
 *   private onIndexChange = (selectedIndex: number) => {
 *     this.setState({ selectedIndex });
 *   };
 *
 *   private shouldLoadPageContent = (index: number): boolean => {
 *     return index === this.state.selectedIndex;
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <ViewPager
 *         selectedIndex={this.state.selectedIndex}
 *         shouldLoadComponent={this.shouldLoadPageContent}
 *         onSelect={this.onIndexChange}>
 *         <View>
 *           <Text>Tab 1</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 2</Text>
 *         </View>
 *         <View>
 *           <Text>Tab 3</Text>
 *         </View>
 *       </ViewPager>
 *     );
 *   }
 * }
 * ```
 */

export class ViewPager extends React.Component<ViewPagerProps> implements PanResponderCallbacks {

  static defaultProps: Partial<ViewPagerProps> = {
    selectedIndex: 0,
    shouldLoadComponent: (): boolean => true,
  };

  private containerRef: React.RefObject<View> = React.createRef();
  private contentWidth: number = 0;
  private contentOffsetValue: number = 0;
  private contentOffset: Animated.Value = new Animated.Value(this.contentOffsetValue);
  private panResponder: PanResponderInstance = PanResponder.create(this);

  public componentDidMount() {
    this.contentOffset.addListener(this.onContentOffsetAnimationStateChanged);
  }

  public componentWillUnmount() {
    this.contentOffset.removeAllListeners();
  }

  public onMoveShouldSetPanResponder = (event: GestureResponderEvent, state: PanResponderGestureState): boolean => {
    const isHorizontalMove: boolean = Math.abs(state.dx) > 0 && Math.abs(state.dx) > Math.abs(state.dy);

    if (isHorizontalMove) {
      const nextSelectedIndex: number = this.props.selectedIndex - Math.sign(state.dx);

      return nextSelectedIndex >= 0 && nextSelectedIndex < this.getChildCount();
    }

    return false;
  };

  public onPanResponderMove = (event: GestureResponderEvent, state: PanResponderGestureState) => {
    const selectedPageOffset: number = this.props.selectedIndex * this.contentWidth;

    this.contentOffset.setValue(state.dx - selectedPageOffset);
  };

  public onPanResponderRelease = (event: GestureResponderEvent, state: PanResponderGestureState) => {
    if (Math.abs(state.vx) >= 0.5 || Math.abs(state.dx) >= 0.5 * this.contentWidth) {
      const index: number = state.dx > 0 ? this.props.selectedIndex - 1 : this.props.selectedIndex + 1;
      this.scrollToIndex({ index, animated: true });
    } else {
      const index: number = this.props.selectedIndex;
      this.scrollToIndex({ index, animated: true });
    }
  };

  public scrollToIndex(params: { index: number, animated?: boolean }) {
    const { index, ...rest } = params;
    const offset: number = this.contentWidth * index;

    this.scrollToOffset({ offset, ...rest });
  }

  public scrollToOffset = (params: { offset: number, animated?: boolean }) => {
    this.createOffsetAnimation(params).start(this.onContentOffsetAnimationStateEnd);
  };

  private onLayout = (event: LayoutChangeEvent) => {
    this.contentWidth = event.nativeEvent.layout.width / this.getChildCount();

    this.scrollToIndex({
      index: this.props.selectedIndex,
    });
  };

  private onContentOffsetAnimationStateChanged = (state: { value: number }) => {
    this.contentOffsetValue = -state.value;

    if (this.props.onOffsetChange) {
      this.props.onOffsetChange(this.contentOffsetValue);
    }
  };

  private onContentOffsetAnimationStateEnd = (result: { finished: boolean }) => {
    const selectedIndex: number = this.contentOffsetValue / this.contentWidth;

    if (selectedIndex !== this.props.selectedIndex && this.props.onSelect) {
      this.props.onSelect(Math.round(selectedIndex));
    }
  };

  private createOffsetAnimation = (params: { offset: number, animated?: boolean }): Animated.CompositeAnimation => {
    const animationDuration: number = params.animated ? 300 : 0;

    return Animated.timing(this.contentOffset, {
      toValue: -params.offset,
      easing: Easing.linear,
      duration: animationDuration,
    });
  };

  private renderComponentChild = (source: ChildElement, index: number): ChildElement => {
    const contentView: ChildElement | null = this.props.shouldLoadComponent(index) ? source : null;

    return (
      <View style={styles.contentContainer}>
        {contentView}
      </View>
    );
  };

  private renderComponentChildren = (source: ChildrenProp): ChildElement[] => {
    return React.Children.map(source, this.renderComponentChild);
  };

  private getChildCount = (): number => {
    return React.Children.count(this.props.children);
  };

  private getContainerStyle = (): ViewStyle => {
    return {
      width: `${100 * this.getChildCount()}%`,

      // @ts-ignore: RN has no types for `Animated` styles
      transform: [{ translateX: this.contentOffset }],
    };
  };

  public render(): React.ReactNode {
    const { style, children, ...restProps } = this.props;

    return (
      <Animated.View
        {...restProps}
        ref={this.containerRef}
        style={[styles.container, style, this.getContainerStyle()]}
        onLayout={this.onLayout}
        {...this.panResponder.panHandlers}>
        {this.renderComponentChildren(children)}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
});
