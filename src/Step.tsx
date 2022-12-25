import {
    ProCard,
    ProForm,

    ProFormList,
    ProFormDigit,
    ProFormSelect,
    StepsForm,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { useRef, useState } from 'react';
import data from './data.json'
import type { FormListActionType } from '@ant-design/pro-components';

type DataSourceType = {
    id: React.Key;
    dish?: string;
    number?: number;
};


export default () => {

    const [meal, setMeal] = useState<string>('')
    const [peopleCount, setCount] = useState<number>(0)
    const [restaurant, setRest] = useState<string>('')
    const [dishes, setDishes] = useState<readonly DataSourceType[]>([])

    const allData = data.dishes
    const restaurantAvailable: { value: string, label: React.ReactNode }[] = []
    const [rA, setRa] = useState<{ value: string, label: React.ReactNode }[]>([])
    const dishAvailable: { value: string, label: React.ReactNode, disabled: boolean }[] = []
    const temp: string[] = []
    let choosed: string[] = []
    const dishData: any[] = []

    const actionRef = useRef<FormListActionType<{ name: string; }>>()

    return (
        <ProCard>
            <StepsForm<{
                name: string;
            }>
                onFinish={async (values) => {
                    console.log(values)
                    message.success('Successfully submited')
                    return
                }}
                formProps={{
                    validateMessages: {
                        required: 'This filed is required',
                    },
                }}
                submitter={{
                    render: (props) => {
                        if (props.step === 0) {
                            return (
                                <Button type="primary" onClick={() => props.onSubmit?.()}>
                                    next
                                </Button>
                            );
                        }

                        if (props.step === 1) {
                            return [
                                <Button key="pre" onClick={() => {
                                    props.form?.resetFields()
                                    props.onPre?.()
                                }}>
                                    previous
                                </Button>,
                                <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                                    next
                                </Button>,
                            ];
                        }

                        if (props.step === 2) {
                            return [
                                <Button key="pre" onClick={() => {
                                    props.form?.resetFields()
                                    actionRef.current?.remove([1, 2, 3, 4, 5, 6, 7, 8, 9])
                                    props.onPre?.()
                                }}>
                                    previous
                                </Button>,
                                <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                                    next
                                </Button>,
                            ];
                        }

                        return [
                            <Button key="pre" onClick={() => {
                                props.form?.resetFields()
                                props.onPre?.()
                            }}>
                                previous
                            </Button>,
                            <Button type="primary" key="goToTree" onClick={() => props.onSubmit?.()}>
                                提交
                            </Button>,
                        ];
                    },
                }}
            >
                <StepsForm.StepForm<{
                    meal: string;
                    peoplecount: number;
                }>
                    name="step1"
                    title="Step1"
                    onFinish={async (value) => {

                        const mealNew = value.meal
                        const countNew = value.peoplecount
                        setMeal(mealNew)
                        setCount(countNew)

                        /* Generate available restaurants for step2 options */
                        const temp: string[] = []
                        allData.map((el: any) => {
                            if (el.availableMeals.indexOf(mealNew) !== -1 && temp.indexOf(el.restaurant) === -1) {
                                temp.push(el.restaurant)
                                restaurantAvailable.push({ value: el.restaurant, label: el.restaurant })
                            }
                        })
                        setRa(restaurantAvailable)

                        return true
                    }}
                >
                    <ProFormSelect
                        label="Please Select a Meal"
                        name="meal"
                        width="md"
                        rules={[{ required: true, },]}
                        options={[
                            {
                                value: 'breakfast',
                                label: 'Breakfast',
                            },
                            {
                                value: 'lunch',
                                label: 'Lunch'
                            },
                            {
                                value: 'dinner',
                                label: 'Dinner',
                            },
                        ]}
                    />
                    <ProFormDigit
                        name="peoplecount" label="" width="md"
                        max={10}
                        rules={[{ required: true }]}
                    />
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    restaurant: string;
                }>
                    name="step2"
                    title="Step2"
                    onFinish={async (value) => {
                        const restNew = value.restaurant
                        // console.log(restNew);
                        setRest(restNew)
                        return true
                    }}
                >
                    <ProFormSelect
                        label="Please Select a Restaurant"
                        name="restaurant"
                        width="md"
                        rules={[{ required: true }]}
                        fieldProps={{ options: rA }}
                    />
                </StepsForm.StepForm>
                <StepsForm.StepForm<{
                    dishes: DataSourceType[];
                }>
                    name="step3"
                    title="Step3"
                    onFinish={async (value) => {
                        const dishes = value.dishes
                        setDishes(dishes)
                        return true
                    }}

                >
                    <ProFormList
                        actionRef={actionRef}
                        name="dishes"
                        label="Ordering Dishes"
                        copyIconProps={false}
                        deleteIconProps={{
                            tooltipText: 'Cancel this order',
                        }}
                        itemContainerRender={(doms) => {
                            return <ProForm.Group>{doms}</ProForm.Group>;
                        }}
                        rules={[
                            {
                                validator: (_, value) => {
                                    /* Dishes number validation */
                                    let temp: number = 0
                                    value.map((v: any) => {
                                        temp += Number(v.number) || 0
                                    })
                                    if (temp < peopleCount) {
                                        return Promise.reject(new Error('The total number of dishes is not enough!'));
                                    } else if (temp > 10) {
                                        return Promise.reject(new Error('The total number of dishes is too much!(A maximum of 10 is allowed)'));
                                    }
                                    else {
                                        return Promise.resolve()
                                    }
                                }
                            }
                        ]}
                        initialValue={[{ number: '1' }]}
                    >
                        {(f, index, action) => {
                            /* Get the choosed dish and block */
                            dishData.push(action.getCurrentRowData())
                            choosed = dishData.map((v) => {
                                return v.dish
                            })

                            /* Generate available dishes due to step1 and step2 choice */
                            allData.map((el: any) => {
                                if (el.availableMeals.indexOf(meal) !== -1 && el.restaurant === restaurant && temp.indexOf(el.name) === -1) {
                                    temp.push(el.name)
                                    dishAvailable.push({ value: el.name, label: el.name, disabled: false })
                                }
                                if (temp.indexOf(el.name) !== -1 && choosed.indexOf(el.name) !== -1) {
                                    dishAvailable.map((value, index) => {
                                        if (value.value === el.name) {
                                            value.disabled = true
                                        }
                                    })
                                }

                            })
                            return (
                                <>
                                    <ProFormSelect
                                        key={Math.random()}
                                        name="dish"
                                        label="Dish"
                                        width='sm'
                                        rules={[{ required: true }]}
                                        fieldProps={{ options: dishAvailable }}
                                    />
                                    <ProFormDigit
                                        key={Math.random()}
                                        name="number"
                                        label="Number"
                                        width='sm'
                                        initialValue='1'
                                        max={10}
                                        rules={[{ required: true }]}
                                    />
                                </>
                            )
                        }}
                    </ProFormList>
                </StepsForm.StepForm>

                <StepsForm.StepForm name="review" title="Review">
                    <ProCard
                        title="Ordering Infomation"
                        extra="Details"
                        bordered
                        headerBordered
                    >
                        <ProCard title="Ordering Infomation" colSpan="40%">
                            <div style={{ height: 60 }}>Meal</div>
                            <div style={{ height: 60 }}>No. of People</div>
                            <div style={{ height: 60 }}>Restaurant</div>
                            <div style={{ height: 60 }}>Dishes</div>
                        </ProCard>
                        <ProCard title="Details">
                            <div style={{ height: 60 }}>{meal}</div>
                            <div style={{ height: 60 }}>{peopleCount}</div>
                            <div style={{ height: 60 }}>{restaurant}</div>
                            <div >
                                <ProCard bordered>
                                    <ProCard title="Dish" colSpan="50%">
                                        {dishes?.map((dish) => {
                                            return (
                                                <div style={{ height: 60 }}>{dish.dish}</div>
                                            )
                                        })}
                                    </ProCard>
                                    <ProCard title="Number">
                                        {dishes?.map((dish) => {
                                            return (
                                                <div style={{ height: 60 }}>{dish.number}</div>
                                            )
                                        })}
                                    </ProCard>
                                </ProCard>
                            </div>
                        </ProCard>
                    </ProCard>
                </StepsForm.StepForm>
            </StepsForm>
        </ProCard>
    );
};