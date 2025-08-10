import { Layout } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import LeftToolBar from './components/LeftToolBar';
import ImageSelector from './components/ImageSelector';
import ImageEditor from './components/ImageEditor';

const App = () => {
    return (
        <Layout className="h-[80vh] w-full overflow-hidden bg-red-400">
            <Layout>
                <Header className="bg-yellow-400">Header</Header>
                <Content className="bg-slate-200">
                    <ImageEditor />
                </Content>
                <Footer className="bg-green-400 p-0">
                    <ImageSelector />
                </Footer>
            </Layout>
            <Sider
                width="20%"
                className="bg-ColorToken-secondaryToken-300"
            >
                <LeftToolBar />
            </Sider>
        </Layout>
    );
};

export default App;
 