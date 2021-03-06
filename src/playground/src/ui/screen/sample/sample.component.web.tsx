import React from 'react';
import {
  ImageSourcePropType,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Input,
  Layout,
  LayoutProps,
  Text,
  Toggle,
} from '@kitten/ui';
import {
  ThemedComponentProps,
  ThemeType,
  withStyles,
} from '@kitten/theme';

interface ComponentProps {
  profileImage: ImageSourcePropType;
  isDark: () => boolean;
  setTheme: (dark: boolean) => void;
}

type SampleComponentProps = ComponentProps & ThemedComponentProps;

class SampleComponent extends React.Component<SampleComponentProps> {

  public render(): React.ReactElement<LayoutProps> {
    const { themedStyle, profileImage, isDark, setTheme } = this.props;

    return (
      <Layout
        style={themedStyle.container}
        level='4'>
        <Layout style={themedStyle.cardContainer}>
          <Layout
            style={themedStyle.cardHeader}
            level='3'>
            <View style={themedStyle.themeToggleContainer}>
              <Text
                style={themedStyle.themeText}
                category='s2'>
                Dark Mode
              </Text>
              <Toggle
                size='small'
                checked={isDark()}
                onChange={setTheme}
              />
            </View>
            <Avatar
              style={themedStyle.profileImage}
              source={profileImage}
            />
            <View style={themedStyle.welcomeContainer}>
              <Text category='h4'>Welcome</Text>
              <Text category='s1'>Sign in to your account</Text>
            </View>
          </Layout>
          <Layout
            style={themedStyle.formContainer}
            level='1'>
            <Input
              style={themedStyle.formInput}
              textStyle={themedStyle.formInputBox}
              label='Email'
              placeholder='contact@akveo.com'
            />
            <Input
              style={themedStyle.formInput}
              textStyle={themedStyle.formInputBox}
              label='Password'
              placeholder='********'
            />
            <Button style={themedStyle.signInButton}>SIGN IN</Button>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export const Sample = withStyles(SampleComponent, (theme: ThemeType) => ({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 192,
    paddingHorizontal: 24,
  },
  themeToggleContainer: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    marginHorizontal: 8,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderWidth: 4,
    borderColor: theme['border-basic-color-4'],
  },
  welcomeContainer: {
    paddingHorizontal: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  formInput: {
    marginVertical: 4,
  },
  formInputBox: {
    outlineWidth: 0,
  },
  signInButton: {
    marginVertical: 16,
  },
}));

