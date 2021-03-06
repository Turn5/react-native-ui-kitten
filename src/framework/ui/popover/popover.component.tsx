/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import {
  ModalService,
  styled,
  StyledComponentProps,
  StyleType,
} from '@kitten/theme';
import {
  PopoverView,
  PopoverViewProps,
} from './popoverView.component';
import {
  MeasuredElement,
  MeasureNode,
  MeasureResult,
  MeasuringElement,
  MeasuringElementProps,
  MeasuringNode,
} from './measure.component';
import {
  Frame,
  OffsetRect,
  Offsets,
  PopoverPlacement,
  PopoverPlacements,
} from './type';
import { ModalPresentingBased } from '../support/typings';

type ContentElement = React.ReactElement<any>;
type ChildElement = React.ReactElement<any>;

interface ComponentProps extends PopoverViewProps, ModalPresentingBased {
  content: ContentElement;
  children: ChildElement;
  visible?: boolean;
}

export type PopoverProps = StyledComponentProps & ViewProps & ComponentProps;

const TAG_CHILD: number = 0;
const TAG_CONTENT: number = 1;
const PLACEMENT_DEFAULT: PopoverPlacement = PopoverPlacements.BOTTOM;

/**
 * Displays content in a modal when users focus on or tap an element.
 *
 * @extends React.Component
 *
 * @property {React.ReactElement<any>} content - Determines the content of the popover.
 *
 * @property {React.ReactElement<any>} children - Determines the element "above" which popover will be shown.
 *
 * @property {boolean} visible - Determines whether popover is visible or not.
 *
 * @property {string | PopoverPlacement} placement - Determines the placement of the popover.
 * Can be `left`, `top`, `right`, `bottom`, `left start`, `left end`, `top start`, `top end`, `right start`,
 * `right end`, `bottom start` or `bottom end`.
 * Default is `bottom`.
 *
 * @property {number} indicatorOffset - Determines the offset of indicator (arrow).
 * @property {StyleProp<ViewStyle>} indicatorStyle - Determines style of indicator (arrow).
 *
 * @property ViewProps
 *
 * @property ModalPresentingBased
 *
 * @property StyledComponentProps
 *
 * @example Popover usage example
 *
 * ```
 * import React from 'react';
 * import {
 *  View,
 *  ViewProps,
 * } from 'react-native';
 * import {
 *   Popover,
 *   Button,
 *   Text,
 * } from 'react-native-ui-kitten';
 *
 * export class PopoverShowcase extends React.Component {
 *   public state: State = {
 *     popoverVisible: false,
 *   };
 *
 *   private togglePopover = () => {
 *     this.setState({ popoverVisible: !this.state.popoverVisible });
 *   };
 *
 *   private renderPopoverContentElement = (): React.ReactElement<ViewProps> => {
 *     return (
 *       <View style={styles.popoverContent}>
 *         <Text>Hi! This is popover.</Text>
 *       </View>
 *     );
 *   };
 *
 *   public render(): React.ReactNode {
 *     return (
 *       <Popover
 *         visible={this.state.popoverVisible}
 *         content={this.renderPopoverContentElement()}
 *         onBackdropPress={this.togglePopover}>
 *         <Button onPress={this.togglePopover}>
 *           TOGGLE POPOVER
 *         </Button>
 *       </Popover>
 *     );
 *   }
 * }
 * ```
 */

export class PopoverComponent extends React.Component<PopoverProps> {

  static styledComponentName: string = 'Popover';

  static defaultProps: Partial<PopoverProps> = {
    placement: PLACEMENT_DEFAULT.rawValue,
    visible: false,
    allowBackdrop: true,
    onBackdropPress: () => null,
  };

  private popoverElement: MeasuredElement;
  private popoverModalId: string = '';

  public componentDidUpdate(prevProps: PopoverProps) {
    const { visible } = this.props;

    if (prevProps.visible !== visible) {
      if (visible) {
        // Toggles re-measuring
        this.setState({ layout: undefined });
      } else {
        this.popoverModalId = ModalService.hide(this.popoverModalId);
      }
    }
  }

  public componentWillUnmount() {
    this.popoverModalId = '';
  }

  private getComponentStyle = (source: StyleType): StyleType => {
    const {
      indicatorWidth,
      indicatorHeight,
      indicatorBackgroundColor,
      ...containerParameters
    } = source;

    return {
      container: containerParameters,
      indicator: {
        width: indicatorWidth,
        height: indicatorHeight,
        backgroundColor: indicatorBackgroundColor,
      },
      child: {},
    };
  };

  private onMeasure = (layout: MeasureResult) => {
    const { visible } = this.props;

    if (visible) {
      this.popoverModalId = this.showPopoverModal(this.popoverElement, layout);
    }
  };

  private showPopoverModal = (element: MeasuredElement, layout: MeasureResult): string => {
    const { placement, allowBackdrop, onBackdropPress } = this.props;

    const popoverFrame: Frame = this.getPopoverFrame(layout, placement);

    const { origin: popoverPosition } = popoverFrame;

    const additionalStyle: ViewStyle = {
      left: popoverPosition.x,
      top: popoverPosition.y,
      opacity: 1,
    };

    const popover: React.ReactElement<ModalPresentingBased> = React.cloneElement(element, {
      style: additionalStyle,
    });

    return ModalService.show(popover, {
      allowBackdrop,
      onBackdropPress,
    });
  };

  private getPopoverFrame = (layout: MeasureResult, rawPlacement: string | PopoverPlacement): Frame => {
    const { children } = this.props;
    const { [TAG_CONTENT]: popoverFrame, [TAG_CHILD]: childFrame } = layout;

    const offsetRect: OffsetRect = Offsets.find(children.props.style);
    const placement: PopoverPlacement = PopoverPlacements.parse(rawPlacement, PLACEMENT_DEFAULT);

    return placement.frame(popoverFrame, childFrame, offsetRect);
  };

  private renderPopoverElement = (children: ContentElement, popoverStyle: Partial<StyleType>): MeasuringElement => {
    const { style, placement, indicatorStyle, ...derivedProps } = this.props;

    const measuringProps: MeasuringElementProps = {
      tag: TAG_CONTENT,
    };

    const popoverPlacement: PopoverPlacement = PopoverPlacements.parse(placement, PLACEMENT_DEFAULT);
    const indicatorPlacement: PopoverPlacement = popoverPlacement.reverse();

    return (
      <View
        {...measuringProps}
        key={TAG_CONTENT}
        style={styles.container}>
        <PopoverView
          {...derivedProps}
          style={[popoverStyle.container, style]}
          indicatorStyle={[popoverStyle.indicator, styles.indicator, indicatorStyle]}
          placement={indicatorPlacement.rawValue}>
          {children}
        </PopoverView>
      </View>
    );
  };

  private renderChildElement = (source: ChildElement, style: StyleProp<ViewStyle>): MeasuringElement => {
    const measuringProps: MeasuringElementProps = { tag: TAG_CHILD };

    return (
      <View
        {...measuringProps}
        key={TAG_CHILD}
        style={[style, styles.child]}>
        {source}
      </View>
    );
  };

  private renderMeasuringElement = (...children: MeasuringElement[]): MeasuringNode => {
    return (
      <MeasureNode
        onResult={this.onMeasure}>
        {children}
      </MeasureNode>
    );
  };

  public render(): MeasuringNode | React.ReactNode {
    const { themedStyle, content, visible, children } = this.props;
    const { child, ...popoverStyles } = this.getComponentStyle(themedStyle);

    if (visible) {
      this.popoverElement = this.renderPopoverElement(content, popoverStyles);
      const childElement: MeasuringElement = this.renderChildElement(children, child);

      return this.renderMeasuringElement(childElement, this.popoverElement);
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    opacity: 0,
  },
  indicator: {},
  child: {},
});

export const Popover = styled<PopoverProps>(PopoverComponent);
